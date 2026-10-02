// Small, swappable token storage. Replace the body to use another store
// (sessionStorage, in-memory, cookies...) without touching the rest of the app.
const KEY = 'studio_admin_token'

export const tokenStorage = {
  get(): string | null {
    try { return localStorage.getItem(KEY) } catch { return null }
  },
  set(token: string): void {
    try { localStorage.setItem(KEY, token) } catch { /* ignore */ }
  },
  clear(): void {
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  },
}
