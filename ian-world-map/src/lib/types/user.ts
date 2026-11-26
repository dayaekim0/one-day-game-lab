export type AuthProvider = 'kakao' | 'google' | 'anonymous';

export interface AppUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
  provider: AuthProvider;
}
