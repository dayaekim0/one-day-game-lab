/**
 * 로컬 프로토타입용 익명 사용자.
 * 기기마다 랜덤 ID를 만들어 "내 후기" 판별에만 사용합니다.
 * Supabase 연동 시 카카오/구글 OAuth로 대체됩니다.
 */
import type { AppUser } from '../../types';
import type { AuthService } from '../contracts';
import { newId, readJSON, writeJSON } from './storage';

const USER_KEY = 'user:v1';

export const localAuth: AuthService & {
  ensureAnonymousUser(nickname?: string): Promise<AppUser>;
} = {
  async getCurrentUser() {
    return readJSON<AppUser | null>(USER_KEY, null);
  },

  async ensureAnonymousUser(nickname) {
    const existing = readJSON<AppUser | null>(USER_KEY, null);
    if (existing) {
      if (nickname && existing.nickname !== nickname) {
        const updated = { ...existing, nickname };
        writeJSON(USER_KEY, updated);
        return updated;
      }
      return existing;
    }
    const user: AppUser = { id: newId(), nickname: nickname || '익명 부모', provider: 'anonymous' };
    writeJSON(USER_KEY, user);
    return user;
  },

  async signIn() {
    // 프로토타입에서는 소셜 로그인 없이 익명 사용자로 동작
    await this.ensureAnonymousUser();
  },

  async signOut() {
    writeJSON(USER_KEY, null);
  },
};
