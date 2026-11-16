export interface Badge { class: string; name: string }
export interface Profile { userName: string; name: string; avatar: string; memberSince: string; badges: Badge[] }
export interface Snapshot { profile: Profile; avatarData: string; fetchedAt: number; stale?: boolean }
export interface Env { DB: D1Database; ASSETS: Fetcher; DEMO_MODE?: string; PROFILE_TTL_SECONDS?: string }
export type FetchSource = (input: string, init?: RequestInit) => Promise<Response>;
export class AppError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
