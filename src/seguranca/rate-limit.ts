const STORAGE_KEY = "ceclos_admin_guard";
const MAX_ATTEMPTS = 4;
const BASE_LOCKOUT_SECONDS = 45;

interface GuardState {
  attempts: number;
  lockedUntil: number;
}

function read(): GuardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { attempts: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw) as GuardState;
    return {
      attempts: Number(parsed.attempts) || 0,
      lockedUntil: Number(parsed.lockedUntil) || 0,
    };
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function write(state: GuardState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function remainingLockoutSeconds(): number {
  const { lockedUntil } = read();
  const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

export function registerFailedAttempt(): number {
  const state = read();
  const attempts = state.attempts + 1;
  let lockedUntil = state.lockedUntil;
  if (attempts >= MAX_ATTEMPTS) {
    const overflow = attempts - MAX_ATTEMPTS;
    const penalty = BASE_LOCKOUT_SECONDS * Math.pow(2, overflow);
    lockedUntil = Date.now() + penalty * 1000;
  }
  write({ attempts, lockedUntil });
  return remainingLockoutSeconds();
}

export function resetAttempts(): void {
  write({ attempts: 0, lockedUntil: 0 });
}
