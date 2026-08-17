/**
 * Hand-maintained release map for New pills on the BI lab and /charts gallery.
 * `manifest.ts` is auto-generated — which release a capability landed in is not
 * derivable from the registry, so this file is reviewed with the lab.
 *
 * A pill shows only while `NEW_IN[id] === CURRENT_RELEASE`. Bump CURRENT_RELEASE
 * to retire last release's pills automatically.
 */
export const CURRENT_RELEASE = "0.3.2";

export const NEW_IN: Record<string, string> = {
  "interaction.composed-mark-click": "0.3.0",
  "interaction.empty-plot": "0.3.0",
  "interaction.null-datum": "0.3.0",
  "interaction.no-handler": "0.3.0",
  "interaction.modifiers": "0.3.0",
  "interaction.line-click": "0.3.0",
  "interaction.pie-click": "0.3.0",
  "legend.controlled": "0.3.0",
  "legend.uncontrolled": "0.3.0",
  "brush.on-brush-change": "0.3.0",
  "axes.dual-tick-formatter": "0.3.0",
  "axes.yaxisid-fallback": "0.3.0",
  "axes.log-scale": "0.3.0",
  "axes.reversed": "0.3.0",
  "axes.label-rotate": "0.3.0",
  "annotations.reference-line-band": "0.3.0",
  "composition.area-in-composed": "0.3.0",
  "states.empty": "0.3.0",
  "states.error": "0.3.0",
  "states.loading": "0.3.0",
  "a11y.keyboard": "0.3.0",
  "a11y.table": "0.3.0",
  "a11y.reduced-motion": "0.3.0",
  "export.to-data-url": "0.3.0",
  "modules.not-imported": "0.3.1",
  "modules.cartesian-omits-zoom": "0.3.1",
  "modules.heatmap-extras": "0.3.1",
  "modules.calendar-extras": "0.3.1",
  "modules.radar-extras": "0.3.1",
  "modules.funnel-extras": "0.3.1",
  "modules.brush-mini": "0.3.1",
  "a11y.pie-table": "0.3.1",
  "composition.dashed-line": "0.3.1",
  "composition.shared-datakey": "0.3.1",
};

export function isNew(id: string): boolean {
  return NEW_IN[id] === CURRENT_RELEASE;
}

/** Lab / gallery ids whose version matches the current release. */
export function whatsNewIds(): string[] {
  return Object.entries(NEW_IN)
    .filter(([, version]) => version === CURRENT_RELEASE)
    .map(([id]) => id);
}
