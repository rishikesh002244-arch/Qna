"use client";

import confetti from "canvas-confetti";

export const Confetti = (options?: confetti.Options) => {
  try {
    return confetti(options);
  } catch (err) {
    console.error("Confetti error:", err);
  }
};

export default Confetti;
