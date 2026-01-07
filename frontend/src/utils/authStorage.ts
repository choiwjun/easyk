/**
 * Auth Storage Utility
 *
 * 브라우저 닫으면 자동 로그아웃 (sessionStorage 사용)
 * 로그아웃 시 모든 인증 데이터 초기화
 */

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

// sessionStorage 사용 - 브라우저/탭 닫으면 자동 삭제
const storage = typeof window !== 'undefined' ? window.sessionStorage : null;

export const authStorage = {
  // 토큰 저장
  setToken: (token: string) => {
    storage?.setItem(TOKEN_KEY, token);
  },

  // 토큰 가져오기
  getToken: (): string | null => {
    return storage?.getItem(TOKEN_KEY) || null;
  },

  // 사용자 정보 저장
  setUser: (user: object) => {
    storage?.setItem(USER_KEY, JSON.stringify(user));
  },

  // 사용자 정보 가져오기
  getUser: <T = object>(): T | null => {
    const userStr = storage?.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as T;
    } catch {
      return null;
    }
  },

  // 로그인 시 토큰과 사용자 정보 저장
  login: (token: string, user: object) => {
    authStorage.setToken(token);
    authStorage.setUser(user);
  },

  // 로그아웃 시 모든 인증 데이터 삭제
  logout: () => {
    storage?.removeItem(TOKEN_KEY);
    storage?.removeItem(USER_KEY);
    // 추가 정리: 관련 데이터 모두 삭제
    storage?.removeItem('saved_jobs');
    storage?.removeItem('draft_application');
  },

  // 인증 여부 확인
  isAuthenticated: (): boolean => {
    return !!authStorage.getToken();
  },

  // 전체 스토리지 초기화 (완전 로그아웃)
  clearAll: () => {
    storage?.clear();
  },
};

export default authStorage;
