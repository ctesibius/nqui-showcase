/** True on a Mac, where the primary modifier is ⌘ and not Ctrl. */
export function isMacOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform =
    nav.userAgentData?.platform || navigator.platform || navigator.userAgent;
  return /mac/i.test(platform);
}
