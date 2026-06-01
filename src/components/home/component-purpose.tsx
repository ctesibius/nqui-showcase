/** Labels why a primitive appears in this scene — not a prop reference. */
export function ComponentPurpose({ label, reason }: { label: string; reason: string }) {
  return (
    <p className="text-xs uppercase tracking-wider text-muted-foreground">
      <span className="font-medium text-foreground/80">{label}</span>
      {" — "}
      {reason}
    </p>
  );
}
