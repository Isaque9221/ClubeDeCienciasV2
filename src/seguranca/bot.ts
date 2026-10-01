const MIN_HUMAN_INTERACTION_MS = 300;

export function createInteractionTimer(): () => boolean {
  const startedAt = Date.now();
  return () => Date.now() - startedAt >= MIN_HUMAN_INTERACTION_MS;
}

export function isHoneypotTriggered(value: string): boolean {
  return value.trim().length > 0;
}
