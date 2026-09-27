import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models } from "appwrite";
import { account } from "@/models/client/config";

export interface UserPrefs {
  reputation: number;
}

interface IAuthStore {
  session: Models.Session | null;
  jwt: string | null;
  user: Models.User<UserPrefs> | null;
  hydrated: boolean;
  setHydrated(): void;
  verifySession(): Promise<void>;
  login(
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  createAccount(
    name: string,
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  logout(): Promise<void>;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    immer((set) => ({
      session: null,
      jwt: null,
      user: null,
      hydrated: false,
      
      setHydrated() {
        set((state) => {
          state.hydrated = true;
        });
      },

      async verifySession() {
        try {
          const session = await account.getSession("current");
          set((state) => {
            state.session = session;
          });
        } catch (error) {
          console.error("Error verifying session:", error);
        }
      },

      async login(email: string, password: string) {
        try {
          const session = await account.createEmailPasswordSession(email, password);
          const [user, { jwt }] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT(),
          ]);

          // Check if reputation exists, if not initialize it
          if (user.prefs?.reputation === undefined) {
            const updatedUser = await account.updatePrefs<UserPrefs>({
              reputation: 0,
            });
          }

          // This must be OUTSIDE the if-block to ensure state updates for all users
          set((state) => {
            state.session = session;
            state.user = user;
            state.jwt = jwt;
          });

          return { success: true };
        } catch (error) {
          console.error("Error logging in:", error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async createAccount(name: string, email: string, password: string) {
        try {
          await account.create(ID.unique(), email, password, name);
          return { success: true };
        } catch (error) {
          console.error("Error creating account:", error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async logout() {
        try {
          await account.deleteSessions();
          set((state) => {
            state.session = null;
            state.user = null;
            state.jwt = null;
          });
        } catch (error) {
          console.error("Error logging out:", error);
        }
      },
    })),
    {
      name: "auth",
      onRehydrateStorage() {
        return (state, error) => {
          if (!error && state) {
            state.setHydrated();
          }
        };
      },
    },
  ),
);