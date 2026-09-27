"use client";

import RTE from "@/components/RTE";
import Meteors from "@/components/magicui/meteors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import slugify from "@/utils/slugify";
import { IconX } from "@tabler/icons-react";
import { ID } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";
import { databases, storage } from "@/models/client/config";
import { db, questionAttachmentBucket, questionCollection } from "@/models/name";
import { Confetti } from "@/components/magicui/confetti";

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col space-y-2 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl",
        className
      )}
    >
      <Meteors number={15} />
      {children}
    </div>
  );
};

interface QuestionFormProps {
  question?: any;
}

const QuestionForm = ({ question }: QuestionFormProps) => {
  const { user } = useAuthStore();
  const [tag, setTag] = React.useState("");
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    title: String(question?.title || ""),
    content: String(question?.content || ""),
    authorId: user?.$id || question?.authorId,
    tags: new Set<string>((question?.tags || []) as string[]),
    attachment: null as File | null,
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadConfetti = (timeInMS = 2500) => {
    const end = Date.now() + timeInMS;
    const colors = ["#38bdf8", "#818cf8", "#c084fc", "#f472b6"];

    const frame = () => {
      if (Date.now() > end) return;

      Confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      Confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  const create = async () => {
    let attachmentId: string | null = null;
    if (formData.attachment) {
      const storageResponse = await storage.createFile(
        questionAttachmentBucket,
        ID.unique(),
        formData.attachment
      );
      attachmentId = storageResponse.$id;
    }

    const response = await databases.createDocument(db, questionCollection, ID.unique(), {
      title: formData.title,
      content: formData.content,
      authorId: user?.$id || formData.authorId,
      tags: Array.from(formData.tags),
      attachmentId: attachmentId || "",
    });

    loadConfetti();
    return response;
  };

  const update = async () => {
    if (!question) throw new Error("Question metadata missing");

    let attachmentId = question.attachmentId || "";
    if (formData.attachment) {
      if (question.attachmentId) {
        try {
          await storage.deleteFile(questionAttachmentBucket, question.attachmentId);
        } catch (e) {
          console.warn("Could not delete old attachment:", e);
        }
      }

      const file = await storage.createFile(
        questionAttachmentBucket,
        ID.unique(),
        formData.attachment
      );
      attachmentId = file.$id;
    }

    const response = await databases.updateDocument(db, questionCollection, question.$id, {
      title: formData.title,
      content: formData.content,
      authorId: user?.$id || formData.authorId,
      tags: Array.from(formData.tags),
      attachmentId: attachmentId,
    });

    return response;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter a question title.");
      return;
    }
    if (!formData.content.trim() || formData.content.length < 15) {
      setError("Please expand on your problem (at least 15 characters).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = question ? await update() : await create();
      router.push(`/questions/${response.$id}/${slugify(formData.title)}`);
    } catch (err: any) {
      setError(err?.message || "Failed to submit question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={submit}>
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <LabelInputContainer>
        <Label htmlFor="title" className="text-base font-semibold text-slate-100">
          Question Title
        </Label>
        <p className="text-xs text-slate-400">
          Be specific and imagine you&apos;re asking a question to another developer.
        </p>
        <Input
          id="title"
          name="title"
          placeholder="e.g. How to handle async state rehydration with Zustand in Next.js 15?"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          className="mt-1"
        />
      </LabelInputContainer>

      <LabelInputContainer>
        <Label htmlFor="content" className="text-base font-semibold text-slate-100">
          Problem Details & Code Snippets
        </Label>
        <p className="text-xs text-slate-400">
          Introduce the problem, describe what you expected, and paste relevant code snippets.
        </p>
        <div className="mt-2">
          <RTE
            value={formData.content}
            onChange={(value) => setFormData((prev) => ({ ...prev, content: value || "" }))}
          />
        </div>
      </LabelInputContainer>

      <LabelInputContainer>
        <Label htmlFor="image" className="text-base font-semibold text-slate-100">
          Attachment Image (Optional)
        </Label>
        <p className="text-xs text-slate-400">
          Attach a screenshot or diagram to clarify your question.
        </p>
        <Input
          id="image"
          name="image"
          accept="image/*"
          type="file"
          onChange={(e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            setFormData((prev) => ({
              ...prev,
              attachment: files[0],
            }));
          }}
          className="mt-1 text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-400 hover:file:bg-cyan-900"
        />
      </LabelInputContainer>

      <LabelInputContainer>
        <Label htmlFor="tag" className="text-base font-semibold text-slate-100">
          Tags
        </Label>
        <p className="text-xs text-slate-400">
          Add up to 5 tags to describe what your question is about.
        </p>
        <div className="flex w-full gap-3 mt-1">
          <Input
            id="tag"
            name="tag"
            placeholder="e.g. react, typescript, appwrite"
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!tag.trim()) return;
                setFormData((prev) => ({
                  ...prev,
                  tags: new Set([...Array.from(prev.tags), tag.trim().toLowerCase()]),
                }));
                setTag("");
              }
            }}
          />
          <button
            className="shrink-0 rounded-xl bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition duration-200"
            type="button"
            onClick={() => {
              if (!tag.trim()) return;
              setFormData((prev) => ({
                ...prev,
                tags: new Set([...Array.from(prev.tags), tag.trim().toLowerCase()]),
              }));
              setTag("");
            }}
          >
            Add Tag
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {Array.from(formData.tags).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-950/80 px-3 py-1 text-xs font-mono text-cyan-300 border border-cyan-800/60"
            >
              #{t}
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    tags: new Set(Array.from(prev.tags).filter((item) => item !== t)),
                  }));
                }}
                className="text-cyan-400 hover:text-rose-400 transition-colors"
              >
                <IconX size={13} />
              </button>
            </span>
          ))}
        </div>
      </LabelInputContainer>

      <button
        className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-indigo-600 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
        type="submit"
        disabled={loading}
      >
        {loading ? "Submitting Question..." : question ? "Update Question" : "🚀 Publish Question"}
      </button>
    </form>
  );
};

export default QuestionForm;
