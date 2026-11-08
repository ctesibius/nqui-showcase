/**
 * Loupe: redlines and source context over a running React app, for development.
 *
 * A small "Loupe" button floats at the bottom-right corner. Click it, or press
 * Alt+Shift+M (⌥⇧M on a Mac), to turn measuring on and off. The chord is not Mod+Alt+M:
 * macOS takes ⌘⌥M to minimize every window, so the app never sees it.
 *
 * While measuring is on:
 *
 * - hover an element to see its size, padding (green), margin (orange), the gaps
 *   between its children (purple), its corner radius, and, for text, the type role,
 *   the line height, the colour tokens and the contrast;
 * - click to pin an element, so the card stays while you read it;
 * - hold Alt to measure the distance from the pinned (or last) element to the one under
 *   the pointer;
 * - press G to show the grid and the chrome band;
 * - press ⌘C (Ctrl+C) to copy the element for an agent: its HTML, the component that
 *   rendered it with the source line, and its owners (`source.ts`). The card also has
 *   Copy and Open in editor;
 * - press Esc to unpin, and Esc again to turn measuring off.
 *
 * Measuring is off at start, because while it is on a click pins an element and does
 * not reach the app. The button stays, so the tool is always one click away.
 *
 * A value off the scale shows in red, with the reason on the card. Every scale comes
 * from the host app through `LoupeConfig` (`config.ts`); this folder holds none.
 *
 * **Development only.** Mount it behind `import.meta.env.DEV`, so a release build does
 * not contain it. It draws with inline styles in fixed redline colours, on purpose: it
 * measures the theme, so it must not take its colours from the theme.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { config, configure, type LoupeConfig } from "./config";
import { isMacOS } from "./platform";
import {
  colorTokens,
  distance,
  radiusSteps,
  readSpec,
  type Check,
  type ColorTokens,
  type Spec,
} from "./measure";
import { isSpacingStep, px } from "./scale";
import {
  elementSnippet,
  elementSource,
  grabText,
  resolveSource,
  type SourceLocation,
} from "./source";

/** Marks the overlay's own controls, so a click on them is not a pin. */
const UI_ATTR = "data-loupe-ui";

/** The chord label for this platform. */
function chordLabel(): string {
  return isMacOS() ? "⌥⇧M" : "Alt+Shift+M";
}

/** The redline colours. Fixed, so the overlay reads the same in either theme. */
const INK = {
  box: "#5b5bd6",
  padding: "rgba(48, 164, 108, 0.28)",
  margin: "rgba(247, 107, 21, 0.24)",
  gap: "rgba(142, 78, 198, 0.32)",
  bad: "#e5484d",
  card: "#111113",
  cardText: "#ededef",
  cardMuted: "#a0a0ab",
  grid: "rgba(91, 91, 214, 0.12)",
  gridBand: "rgba(91, 91, 214, 0.22)",
};

const LAYER: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 2147483646,
  pointerEvents: "none",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 11,
  lineHeight: "16px",
};

function readStored(): boolean {
  try {
    return localStorage.getItem(config().storageKey) === "on";
  } catch {
    return false;
  }
}

function writeStored(on: boolean): void {
  try {
    localStorage.setItem(config().storageKey, on ? "on" : "off");
  } catch {
    // Storage can be blocked; the overlay still works for this load.
  }
}

/** True when the key event comes from a field, where G must stay a letter. */
function inField(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  return (
    t.isContentEditable ||
    t.tagName === "INPUT" ||
    t.tagName === "TEXTAREA" ||
    t.tagName === "SELECT"
  );
}

export function Loupe({ config: hostConfig }: { config: LoupeConfig }) {
  // The host's scales, set before the first read below. `configure` ignores a repeat.
  configure(hostConfig);
  const [on, setOn] = useState(readStored);
  const [grid, setGrid] = useState(false);
  const [hover, setHover] = useState<Element | null>(null);
  const [pinned, setPinned] = useState<Element | null>(null);
  const [alt, setAlt] = useState(false);
  const [, setTick] = useState(0);
  const anchor = useRef<Element | null>(null);
  const scales = useRef<{
    radius: number[];
    colors: ColorTokens;
    theme: string;
  } | null>(null);
  const frame = useRef(0);
  const [source, setSource] = useState<{
    el: Element;
    components: string[];
    location: SourceLocation | null;
  } | null>(null);
  /** The element the card describes, for the key handler. */
  const focusRef = useRef<Element | null>(null);

  const toggle = useCallback((next: boolean) => {
    setOn(next);
    writeStored(next);
    if (!next) {
      setPinned(null);
      setHover(null);
      setGrid(false);
    }
  }, []);

  // The chord and the keys of the overlay.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = isMacOS() ? e.metaKey : e.ctrlKey;
      if (!mod && e.altKey && e.shiftKey && e.code === "KeyM") {
        e.preventDefault();
        toggle(!on);
        return;
      }
      if (!on) return;
      if (e.key === "Alt") {
        setAlt(true);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (pinned) setPinned(null);
        else toggle(false);
        return;
      }
      if (e.code === "KeyG" && !mod && !e.altKey && !inField(e)) {
        e.preventDefault();
        setGrid((g) => !g);
        return;
      }
      // ⌘C copies the element for an agent, unless the person copies selected text.
      const selection = window.getSelection();
      if (
        mod &&
        e.code === "KeyC" &&
        !e.shiftKey &&
        !e.altKey &&
        !inField(e) &&
        (!selection || selection.isCollapsed) &&
        focusRef.current
      ) {
        e.preventDefault();
        e.stopPropagation();
        void copyForAgent(focusRef.current);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAlt(false);
    };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [on, pinned, toggle]);

  // Follow the pointer; a click pins.
  useEffect(() => {
    if (!on) return;
    const onMove = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      // The overlay's own controls are not part of the app; keep the last element.
      if (target?.closest(`[${UI_ATTR}]`)) return;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => setHover(target));
    };
    const onClick = (e: MouseEvent) => {
      // A click on the overlay's own controls works as a click.
      if (e.target instanceof Element && e.target.closest(`[${UI_ATTR}]`))
        return;
      e.preventDefault();
      e.stopPropagation();
      const target = e.target instanceof Element ? e.target : null;
      setPinned((current) => (current === target ? null : target));
    };
    // Boxes move on scroll and resize; draw them again.
    const redraw = () => setTick((t) => t + 1);
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", redraw, true);
    window.addEventListener("resize", redraw);
    return () => {
      cancelAnimationFrame(frame.current);
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", redraw, true);
      window.removeEventListener("resize", redraw);
    };
  }, [on]);

  // The component and the source line of the element the card describes.
  const focusEl = on ? (pinned ?? hover) : null;
  useEffect(() => {
    focusRef.current = focusEl;
    if (!focusEl) return;
    let live = true;
    const found = elementSource(focusEl);
    if (!found) {
      setSource({ el: focusEl, components: [], location: null });
      return;
    }
    setSource({ el: focusEl, components: found.components, location: null });
    if (found.frame) {
      void resolveSource(found.frame).then((location) => {
        if (live) {
          setSource({ el: focusEl, components: found.components, location });
        }
      });
    }
    return () => {
      live = false;
    };
  }, [focusEl]);

  if (!on) {
    // Under automation the button stays away: a control floating in the page corner
    // takes the clicks a Playwright spec asserts (ST-333). The chord still works.
    if (navigator.webdriver) return null;
    return createPortal(
      <Launcher onOpen={() => toggle(true)} />,
      document.body,
    );
  }

  // The token values change with the theme, so read them again when it changes.
  const theme = `${document.documentElement.className}|${
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "d" : "l"
  }`;
  if (!scales.current || scales.current.theme !== theme) {
    scales.current = { radius: radiusSteps(), colors: colorTokens(), theme };
  }

  const focus = pinned ?? hover;
  const spec = focus?.isConnected ? readSpec(focus, scales.current) : null;
  if (!alt) anchor.current = focus;
  const from =
    alt && anchor.current?.isConnected && anchor.current !== hover
      ? anchor.current.getBoundingClientRect()
      : null;
  const to = alt && hover?.isConnected ? hover.getBoundingClientRect() : null;

  return createPortal(
    <div style={LAYER} data-loupe="">
      {/* The redlines are a picture of the page; a screen reader skips them. */}
      <div aria-hidden="true">
        {grid ? <Grid /> : null}
        {spec ? <Redlines spec={spec} /> : null}
        {from && to ? <Distance a={from} b={to} /> : null}
      </div>
      <HintBar
        pinned={pinned !== null}
        grid={grid}
        onGrid={() => setGrid((g) => !g)}
        onClose={() => toggle(false)}
      />
      {spec ? (
        <Card
          spec={spec}
          radius={scales.current.radius}
          source={source?.el === spec.el ? source : null}
          onCopy={() => void copyForAgent(spec.el)}
        />
      ) : null}
    </div>,
    document.body,
  );
}

/** Copy an element for an agent, in the format React Grab used. */
async function copyForAgent(el: Element): Promise<void> {
  const found = elementSource(el);
  const location = found?.frame ? await resolveSource(found.frame) : null;
  const text = grabText(
    elementSnippet(el),
    found?.components ?? [],
    location,
    config().pathPrefix,
  );
  try {
    await navigator.clipboard.writeText(text);
    config().notify.success(
      found?.components[0]
        ? `Copied ${found.components[0]} for your agent`
        : "Copied the element for your agent",
    );
  } catch {
    config().notify.error("The clipboard refused the copy");
  }
}

/** Open the source line in the editor, through the Vite dev server's own endpoint. */
function openInEditor(location: SourceLocation): void {
  const file = `${location.file}:${location.line}:${location.column}`;
  const endpoint = config().editorEndpoint;
  if (!endpoint) return;
  void fetch(`${endpoint}?file=${encodeURIComponent(file)}`).catch(() =>
    config().notify.error("The dev server could not open the editor"),
  );
}

function Grid() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: [
          `linear-gradient(to bottom, ${INK.gridBand} 1px, transparent 1px)`,
          `linear-gradient(to right, ${INK.grid} 1px, transparent 1px)`,
          `linear-gradient(to bottom, ${INK.grid} 1px, transparent 1px)`,
        ].join(","),
        // The chrome band, over the grid.
        backgroundSize: `100% ${config().bandPx}px, ${config().gridPx}px ${config().gridPx}px, ${config().gridPx}px ${config().gridPx}px`,
      }}
    />
  );
}

function box(r: { left: number; top: number; width: number; height: number }) {
  return {
    position: "absolute" as const,
    left: r.left,
    top: r.top,
    width: Math.max(r.width, 0),
    height: Math.max(r.height, 0),
  };
}

function Tag({
  children,
  bad,
  style,
}: {
  children: ReactNode;
  bad?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        position: "absolute",
        padding: "0 4px",
        borderRadius: 4,
        background: bad ? INK.bad : INK.box,
        color: "#fff",
        whiteSpace: "nowrap",
        fontWeight: 600,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function Redlines({ spec }: { spec: Spec }) {
  const { rect: r, padding: p, margin: m, radius } = spec;
  const pBad = !spec.paddingOk.ok;
  const corners = [...new Set(Object.values(radius).map((v) => Math.round(v)))];
  const radiusText =
    corners.length === 1
      ? corners[0] > 0
        ? `R${corners[0]}`
        : ""
      : `R${corners.join("/")}`;
  return (
    <>
      {/* Margin: four bands outside the border box. */}
      <div
        style={{
          ...box({
            left: r.left - m.left,
            top: r.top - m.top,
            width: r.width + m.left + m.right,
            height: m.top,
          }),
          background: INK.margin,
        }}
      />
      <div
        style={{
          ...box({
            left: r.left - m.left,
            top: r.bottom,
            width: r.width + m.left + m.right,
            height: m.bottom,
          }),
          background: INK.margin,
        }}
      />
      <div
        style={{
          ...box({
            left: r.left - m.left,
            top: r.top,
            width: m.left,
            height: r.height,
          }),
          background: INK.margin,
        }}
      />
      <div
        style={{
          ...box({
            left: r.right,
            top: r.top,
            width: m.right,
            height: r.height,
          }),
          background: INK.margin,
        }}
      />
      {/* Padding: four bands inside the border box. */}
      <div
        style={{
          ...box({ left: r.left, top: r.top, width: r.width, height: p.top }),
          background: INK.padding,
        }}
      />
      <div
        style={{
          ...box({
            left: r.left,
            top: r.bottom - p.bottom,
            width: r.width,
            height: p.bottom,
          }),
          background: INK.padding,
        }}
      />
      <div
        style={{
          ...box({
            left: r.left,
            top: r.top + p.top,
            width: p.left,
            height: r.height - p.top - p.bottom,
          }),
          background: INK.padding,
        }}
      />
      <div
        style={{
          ...box({
            left: r.right - p.right,
            top: r.top + p.top,
            width: p.right,
            height: r.height - p.top - p.bottom,
          }),
          background: INK.padding,
        }}
      />
      {/* The gaps between children. */}
      {spec.gaps.map((g, i) => (
        <div
          key={i}
          style={{
            ...box(g.rect),
            background: g.ok ? INK.gap : "rgba(229,72,77,0.35)",
          }}
        >
          <Tag
            bad={!g.ok}
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            {px(g.px)}
          </Tag>
        </div>
      ))}
      {/* The border box. */}
      <div
        style={{
          ...box(r),
          outline: `1px solid ${INK.box}`,
          borderRadius: `${radius.tl}px ${radius.tr}px ${radius.br}px ${radius.bl}px`,
        }}
      />
      {/* Padding values, one per side that has one. */}
      {p.top > 0 ? (
        <Tag
          bad={pBad}
          style={{
            left: r.left + r.width / 2,
            top: r.top,
            transform: "translate(-50%,-50%)",
          }}
        >
          {px(p.top)}
        </Tag>
      ) : null}
      {p.bottom > 0 ? (
        <Tag
          bad={pBad}
          style={{
            left: r.left + r.width / 2,
            top: r.bottom,
            transform: "translate(-50%,-50%)",
          }}
        >
          {px(p.bottom)}
        </Tag>
      ) : null}
      {p.left > 0 ? (
        <Tag
          bad={pBad}
          style={{
            left: r.left,
            top: r.top + r.height / 2,
            transform: "translate(-50%,-50%)",
          }}
        >
          {px(p.left)}
        </Tag>
      ) : null}
      {p.right > 0 ? (
        <Tag
          bad={pBad}
          style={{
            left: r.right,
            top: r.top + r.height / 2,
            transform: "translate(-50%,-50%)",
          }}
        >
          {px(p.right)}
        </Tag>
      ) : null}
      {/* Size under the box, radius at the top-left corner. */}
      <Tag
        style={{
          left: r.left + r.width / 2,
          top: r.bottom + 4,
          transform: "translateX(-50%)",
        }}
      >
        {px(r.width)} × {px(r.height)}
      </Tag>
      {radiusText ? (
        <Tag bad={!spec.radiusOk.ok} style={{ left: r.left, top: r.top - 18 }}>
          {radiusText}
        </Tag>
      ) : null}
    </>
  );
}

function Distance({ a, b }: { a: DOMRect; b: DOMRect }) {
  const d = distance(a, b);
  const lines: ReactNode[] = [];
  const midY = (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2;
  const midX = (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2;
  if (d.x > 0) {
    const left = b.left >= a.right ? a.right : b.right;
    const y = Number.isFinite(midY) && midY > 0 ? midY : (a.top + b.top) / 2;
    lines.push(
      <div
        key="x"
        style={{
          position: "absolute",
          left,
          top: y,
          width: d.x,
          height: 1,
          background: INK.bad,
        }}
      >
        <Tag
          bad={!isSpacingStep(d.x, config().spacingSteps)}
          style={{ left: "50%", top: -18, transform: "translateX(-50%)" }}
        >
          {px(d.x)}
        </Tag>
      </div>,
    );
  }
  if (d.y > 0) {
    const top = b.top >= a.bottom ? a.bottom : b.bottom;
    const x = Number.isFinite(midX) && midX > 0 ? midX : (a.left + b.left) / 2;
    lines.push(
      <div
        key="y"
        style={{
          position: "absolute",
          left: x,
          top,
          width: 1,
          height: d.y,
          background: INK.bad,
        }}
      >
        <Tag
          bad={!isSpacingStep(d.y, config().spacingSteps)}
          style={{ left: 6, top: "50%", transform: "translateY(-50%)" }}
        >
          {px(d.y)}
        </Tag>
      </div>,
    );
  }
  return (
    <>
      <div style={{ ...box(a), outline: `1px dashed ${INK.bad}` }} />
      {lines}
    </>
  );
}

/** The button that turns measuring on. It shows while measuring is off. */
function Launcher({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title={`Loupe (${chordLabel()})`}
      aria-label={`Turn on Loupe (${chordLabel()})`}
      data-loupe-ui=""
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 2147483646,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 28,
        padding: "0 10px",
        border: 0,
        borderRadius: 14,
        background: INK.card,
        color: INK.cardText,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        fontWeight: 600,
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        cursor: "pointer",
        opacity: 0.85,
      }}
    >
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
        <path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2" />
      </svg>
      Loupe
    </button>
  );
}

const BAR_BUTTON: CSSProperties = {
  height: 22,
  padding: "0 8px",
  border: "1px solid #2e2e32",
  borderRadius: 6,
  background: "transparent",
  color: INK.cardText,
  font: "inherit",
  cursor: "pointer",
};

function HintBar({
  pinned,
  grid,
  onGrid,
  onClose,
}: {
  pinned: boolean;
  grid: boolean;
  onGrid: () => void;
  onClose: () => void;
}) {
  return (
    <div
      data-loupe-ui=""
      style={{
        position: "absolute",
        left: "50%",
        bottom: 12,
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "4px 6px 4px 10px",
        borderRadius: 8,
        background: INK.card,
        color: INK.cardMuted,
        whiteSpace: "nowrap",
        pointerEvents: "auto",
      }}
    >
      <span style={{ color: INK.cardText, fontWeight: 600 }}>Loupe</span>
      <span>
        {pinned ? "pinned, Esc to unpin" : "click to pin"} · hold Alt to measure
      </span>
      <button
        type="button"
        onClick={onGrid}
        aria-pressed={grid}
        style={{ ...BAR_BUTTON, background: grid ? INK.box : "transparent" }}
      >
        Grid (G)
      </button>
      <button type="button" onClick={onClose} style={BAR_BUTTON}>
        Close ({chordLabel()})
      </button>
    </div>
  );
}

function Row({
  name,
  value,
  check,
}: {
  name: string;
  value: ReactNode;
  check?: Check;
}) {
  const bad = check && !check.ok;
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <span style={{ width: 72, flexShrink: 0, color: INK.cardMuted }}>
        {name}
      </span>
      <span
        style={{
          color: bad ? "#ff8589" : INK.cardText,
          minWidth: 0,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function sidesText(s: {
  top: number;
  right: number;
  bottom: number;
  left: number;
}) {
  const v = [s.top, s.right, s.bottom, s.left].map(px);
  if (v.every((x) => x === v[0])) return v[0];
  if (v[0] === v[2] && v[1] === v[3]) return `${v[0]} ${v[1]}`;
  return v.join(" ");
}

function Card({
  spec,
  radius,
  source,
  onCopy,
}: {
  spec: Spec;
  radius: readonly number[];
  source: { components: string[]; location: SourceLocation | null } | null;
  onCopy: () => void;
}) {
  const t = spec.text;
  const notes = [
    spec.paddingOk,
    spec.marginOk,
    spec.radiusOk,
    ...spec.gaps
      .filter((g) => !g.ok)
      .map((g) => ({
        ok: false,
        note: `gap ${px(g.px)}px is off the 4px scale`,
      })),
    t?.size,
    t?.lineHeight,
    t?.contrastCheck,
  ].filter((c): c is Check => Boolean(c && !c.ok));
  const radii = Object.values(spec.radius);
  return (
    <div
      data-loupe-ui=""
      style={{
        position: "absolute",
        right: 12,
        bottom: 44,
        width: 320,
        pointerEvents: "auto",
        padding: 12,
        borderRadius: 12,
        background: INK.card,
        color: INK.cardText,
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{spec.label}</div>
      {source && source.components.length > 0 ? (
        <Row
          name="component"
          value={source.components.slice(0, 3).join(" ‹ ")}
        />
      ) : null}
      {source?.location ? (
        <Row
          name="source"
          value={`${source.location.file}:${source.location.line}`}
        />
      ) : null}
      <Row
        name="size"
        value={`${px(spec.rect.width)} × ${px(spec.rect.height)}`}
      />
      <Row
        name="padding"
        value={sidesText(spec.padding)}
        check={spec.paddingOk}
      />
      <Row name="margin" value={sidesText(spec.margin)} check={spec.marginOk} />
      {spec.gaps.length > 0 ? (
        <Row
          name="gap"
          value={[...new Set(spec.gaps.map((g) => px(g.px)))].join(", ")}
          check={{ ok: spec.gaps.every((g) => g.ok) }}
        />
      ) : null}
      {radii.some((r) => r > 0) ? (
        <Row
          name="radius"
          value={`${[...new Set(radii.map(px))].join("/")} · scale ${radius.map(px).join(", ")}`}
          check={spec.radiusOk}
        />
      ) : null}
      {t ? (
        <>
          <div style={{ height: 6 }} />
          <Row
            name="type"
            value={`${px(t.sizePx)}/${t.lineHeightPx === null ? "normal" : px(t.lineHeightPx)} · ${t.weight}${
              t.roles.length ? ` · text-${t.roles[0]}` : ""
            }`}
            check={{ ok: t.size.ok && t.lineHeight.ok }}
          />
          <Row name="color" value={t.colorToken ?? t.color} />
          <Row name="on" value={t.backgroundToken ?? t.background} />
          <Row
            name="contrast"
            value={t.contrast === null ? "—" : `${t.contrast.toFixed(2)}:1`}
            check={t.contrastCheck}
          />
        </>
      ) : null}
      {notes.length > 0 ? (
        <div
          style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: "1px solid #2e2e32",
            color: "#ff8589",
          }}
        >
          {notes.map((n, i) => (
            <div key={i}>• {n.note}</div>
          ))}
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button type="button" onClick={onCopy} style={BAR_BUTTON}>
          Copy for agent ({isMacOS() ? "⌘C" : "Ctrl+C"})
        </button>
        {source?.location && config().editorEndpoint ? (
          <button
            type="button"
            onClick={() => source.location && openInEditor(source.location)}
            style={BAR_BUTTON}
          >
            Open in editor
          </button>
        ) : null}
      </div>
    </div>
  );
}
