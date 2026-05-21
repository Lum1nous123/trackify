export type MeResponse = {
  id: string; // UUID string
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
};
