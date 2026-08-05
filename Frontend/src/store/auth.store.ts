import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '../types';
interface AuthState { user?: { id: string; name: string; email: string; role: Role }; accessToken?: string; setSession: (session: Pick<AuthState, 'user' | 'accessToken'>) => void; logout: () => void }
export const useAuthStore = create<AuthState>()(persist((set) => ({ setSession: (session) => set(session), logout: () => set({ user: undefined, accessToken: undefined }) }), { name: 'oms-auth' }));
