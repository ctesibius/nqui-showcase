"use client";

import {
  type ChartConfig,
  ChartContainer,
  getColorsCount,
  LoadingIndicator,
} from "@/registry/ui/chart";
import {
  ChartTooltip,
  ChartTooltipContent,
  type TooltipRoundness,
  type TooltipVariant,
} from "@/registry/ui/tooltip";
import { ChartLegend, ChartLegendContent, type ChartLegendVariant } from "@/registry/ui/legend";
import { ChartBackground, type BackgroundVariant } from "@/registry/ui/background";
import { ChartDot, type DotVariant } from "@/registry/ui/dot";
import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type FC,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  CartesianGrid,
  Scatter as RechartsScatter,
  ScatterChart as RechartsScatterChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  type ScatterPointItem,
} from "recharts";

const LOADING_POINTS = 12;
const LOADING_ANIMATION_DURATION = 1500;

// ─────────────────────────────────────────────────────────────────────────────
// Shared context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared state for every part of the chart. Lifted into <EvilScatterChart /> so that
 * <Scatter />, <XAxis />, <Legend />, and friends can read it without prop drilling.
 * Sub-components are composed freely — the provider is the single source of truth.
 */
type ScatterChartContextValue = {
  config: ChartConfig; // colors + labels for every series
  isLoading: boolean; // whether the chart shows its loading skeleton
  selectedDataKey: string | null; // currently selected series, or null when none
  selectDataKey: (dataKey: string | null) => void; // sets the selected series
};

const ScatterChartContext = createContext<ScatterChartContextValue | null>(null);

/** Reads the chart context, throwing a helpful error when used outside <EvilScatterChart />. */
function useScatterChart() {
  const context = use(ScatterChartContext);

  if (!context) {
    throw new Error(
      "Scatter chart parts (<Scatter />, <XAxis />, …) must be used within <EvilScatterChart />",
    );
  }

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root container
// ─────────────────────────────────────────────────────────────────────────────

type EvilScatterChartProps<TConfig extends Record<string, ChartConfig[string]>> = {
  config: TConfig; // series colors + labels
  children: ReactNode; // composed parts — <Scatter />, <XAxis />, <Legend />, …
  className?: string; // extra classes for the chart container
  chartProps?: ComponentProps<typeof RechartsScatterChart>; // escape hatch for the raw Recharts chart
  backgroundVariant?: BackgroundVariant; // background pattern drawn behind the chart
  defaultSelectedDataKey?: string | null; // series selected on first render
  onSelectionChange?: (selectedDataKey: string | null) => void; // fires when the selected series changes
  isLoading?: boolean; // shows the animated loading skeleton
  loadingPoints?: number; // number of points in the loading skeleton
};

/**
 * Root of the composible scatter chart. Owns the shared context and the loading skeleton.
 * Everything visual — axes, grid, tooltip, legend, and the scatter series themselves —
 * is composed as children, so a consumer renders exactly the parts they need.
 */
export function EvilScatterChart<TConfig extends Record<string, ChartConfig[string]>>({
  config,
  children,
  className,
  chartProps,
  backgroundVariant,
  defaultSelectedDataKey = null,
  onSelectionChange,
  isLoading = false,
  loadingPoints,
}: EvilScatterChartProps<TConfig>) {
  const chartId = useId().replace(/:/g, "");
  const [selectedDataKey, setSelectedDataKey] = useState<string | null>(defaultSelectedDataKey);
  const loadingData = useLoadingData(isLoading, loadingPoints);

  const selectDataKey = useCallback(
    (newSelectedDataKey: string | null) => {
      setSelectedDataKey(newSelectedDataKey);
      onSelectionChange?.(newSelectedDataKey);
    },
    [onSelectionChange],
  );

  const contextValue = useMemo<ScatterChartContextValue>(
    () => ({
      config,
      isLoading,
      selectedDataKey,
      selectDataKey,
    }),
    [config, isLoading, selectedDataKey, selectDataKey],
  );

  return (
    <ScatterChartContext value={contextValue}>
      <ChartContainer className={className} config={config}>
        <LoadingIndicator isLoading={isLoading} />
        <RechartsScatterChart id={chartId} accessibilityLayer {...chartProps}>
          {backgroundVariant && <ChartBackground variant={backgroundVariant} />}
          {children}
          {isLoading && <LoadingScatter data={loadingData} />}
        </RechartsScatterChart>
      </ChartContainer>
    </ScatterChartContext>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composible parts
// ─────────────────────────────────────────────────────────────────────────────

type ScatterProps<TPoint extends Record<string, unknown>> = {
  dataKey: string; // series key — must exist in the chart config
  data: TPoint[]; // point rows rendered by this series
  isGlowing?: boolean; // applies a soft outer glow to this series' points
  isClickable?: boolean; // lets this series be selected by clicking it
  children?: ReactNode; // optional <Dot /> and <ActiveDot /> composition
  scatterProps?: Omit<ComponentProps<typeof RechartsScatter>, "data" | "dataKey" | "name">; // escape hatch for raw Recharts Scatter props
};

/**
 * A single scatter series. Each <Scatter /> is self-contained with its own point data and
 * style definitions under a unique id, so multiple series can coexist without collisions.
 * Compose <Dot /> and <ActiveDot /> inside it to style point markers.
 */
export function Scatter<TPoint extends Record<string, unknown>>({
  dataKey,
  data,
  isGlowing = false,
  isClickable = false,
  children,
  scatterProps,
}: ScatterProps<TPoint>) {
  const { config, isLoading, selectedDataKey, selectDataKey } = useScatterChart();
  const id = useId().replace(/:/g, "");

  if (isLoading) return null;

  const isSelected = selectedDataKey === null || selectedDataKey === dataKey;
  const opacity = isClickable && !isSelected ? 0.25 : 1;
  const { dotVariant, activeDotVariant } = resolveDots(children);

  const shape = (props: ScatterPointItem) => (
    <ChartDot
      type={dotVariant}
      cx={props.cx}
      cy={props.cy}
      dataKey={dataKey}
      chartId={id}
      fillOpacity={opacity}
    />
  );

  const activeShape = (props: ScatterPointItem) => (
    <ChartDot
      type={activeDotVariant ?? dotVariant}
      cx={props.cx}
      cy={props.cy}
      dataKey={dataKey}
      chartId={id}
      fillOpacity={opacity}
    />
  );

  return (
    <>
      <RechartsScatter
        name={String(config[dataKey]?.label ?? dataKey)}
        data={data}
        fill={`url(#${id}-colors-${dataKey})`}
        fillOpacity={opacity}
        shape={shape}
        activeShape={activeShape}
        filter={isGlowing ? `url(#${id}-scatter-glow-${dataKey})` : undefined}
        className="transition-opacity duration-200"
        style={isClickable ? { cursor: "pointer" } : undefined}
        onClick={() => {
          if (!isClickable) return;
          selectDataKey(selectedDataKey === dataKey ? null : dataKey);
        }}
        {...scatterProps}
      />
      <defs>
        <ColorGradient id={id} dataKey={dataKey} config={config} />
        {isGlowing && <GlowFilter id={id} dataKey={dataKey} />}
      </defs>
    </>
  );
}

type DotProps = {
  variant?: DotVariant; // visual style of the point marker
};

/** Configuration slot for the resting point marker composed inside a <Scatter />. */
export const Dot: FC<DotProps> = () => null;

/** Configuration slot for the hovered/active point marker composed inside a <Scatter />. */
export const ActiveDot: FC<DotProps> = () => null;

type XAxisProps = ComponentProps<typeof RechartsXAxis>;

/**
 * The horizontal value axis. Defaults to `type="number"` and forwards every Recharts
 * XAxis prop. Hidden automatically while the chart is loading.
 */
export function XAxis({
  type = "number",
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  ...props
}: XAxisProps) {
  return (
    <RechartsXAxis type={type} tickLine={tickLine} axisLine={axisLine} tickMargin={tickMargin} {...props} />
  );
}

type YAxisProps = ComponentProps<typeof RechartsYAxis>;

/**
 * The vertical value axis. Defaults to `type="number"` and forwards every Recharts
 * YAxis prop. Hidden automatically while the chart is loading.
 */
export function YAxis({
  type = "number",
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  width = "auto",
  ...props
}: YAxisProps) {
  return (
    <RechartsYAxis
      type={type}
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      width={width}
      {...props}
    />
  );
}

type GridProps = ComponentProps<typeof CartesianGrid>;

/** The background grid lines. Defaults to horizontal-only dashed lines. */
export function Grid({ vertical = false, strokeDasharray = "3 3", ...props }: GridProps) {
  return <CartesianGrid vertical={vertical} strokeDasharray={strokeDasharray} {...props} />;
}

type TooltipProps = {
  variant?: TooltipVariant; // visual style of the tooltip surface
  roundness?: TooltipRoundness; // border-radius of the tooltip
  defaultIndex?: number; // keeps the tooltip open at this point index
  cursor?: boolean; // whether the crosshair cursor follows the pointer
};

/**
 * The hover tooltip. Reads the chart's selection state so its content dims unselected
 * series. Hidden automatically while the chart is loading.
 */
export function Tooltip({ variant, roundness, defaultIndex, cursor = true }: TooltipProps) {
  const { isLoading, selectedDataKey } = useScatterChart();

  if (isLoading) return null;

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={cursor ? { strokeDasharray: "3 3" } : false}
      content={
        <ChartTooltipContent selected={selectedDataKey} roundness={roundness} variant={variant} />
      }
    />
  );
}

type LegendProps = {
  variant?: ChartLegendVariant; // visual style of the legend indicators
  align?: "left" | "center" | "right"; // horizontal placement
  verticalAlign?: "top" | "middle" | "bottom"; // vertical placement
  isClickable?: boolean; // lets each entry toggle selection of its series
};

/**
 * The series legend. When `isClickable` is set, each entry toggles selection of its
 * series, driving the shared selection state read by every <Scatter />.
 * Hidden automatically while the chart is loading.
 */
export function Legend({
  variant,
  align = "right",
  verticalAlign = "top",
  isClickable = false,
}: LegendProps) {
  const { isLoading, selectedDataKey, selectDataKey } = useScatterChart();

  if (isLoading) return null;

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedDataKey}
          onSelectChange={selectDataKey}
          isClickable={isClickable}
          variant={variant}
        />
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dot helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Pulls `<Dot />` and `<ActiveDot />` out of a scatter's children into marker variants. */
const resolveDots = (children: ReactNode) => {
  let dotVariant: DotVariant = "default";
  let activeDotVariant: DotVariant | undefined;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (child.type === Dot) {
      dotVariant = (child as ReactElement<DotProps>).props.variant ?? "default";
    }

    if (child.type === ActiveDot) {
      activeDotVariant = (child as ReactElement<DotProps>).props.variant;
    }
  });

  return { dotVariant, activeDotVariant };
};

// ─────────────────────────────────────────────────────────────────────────────
// Style definitions
// ─────────────────────────────────────────────────────────────────────────────

type StyleProps = {
  id: string;
  dataKey: string;
  config: ChartConfig;
};

/** Horizontal color gradient for a scatter series' points. */
const ColorGradient = ({ id, dataKey, config }: StyleProps) => {
  const colorsCount = getColorsCount(config[dataKey] ?? {});

  return (
    <linearGradient id={`${id}-colors-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
      {colorsCount === 1 ? (
        <>
          <stop offset="0%" stopColor={`var(--color-${dataKey}-0)`} />
          <stop offset="100%" stopColor={`var(--color-${dataKey}-0)`} />
        </>
      ) : (
        Array.from({ length: colorsCount }, (_, index) => {
          const offset = `${(index / (colorsCount - 1)) * 100}%`;
          return (
            <stop
              key={offset}
              offset={offset}
              stopColor={`var(--color-${dataKey}-${index}, var(--color-${dataKey}-0))`}
            />
          );
        })
      )}
    </linearGradient>
  );
};

/** Soft outer glow filter applied to a scatter series when `isGlowing` is set. */
const GlowFilter = ({ id, dataKey }: Pick<StyleProps, "id" | "dataKey">) => {
  return (
    <filter id={`${id}-scatter-glow-${dataKey}`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.7 0"
        result="glow"
      />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

/** Builds a fresh set of randomized loading points for the skeleton scatter. */
const generateLoadingData = (points: number) => {
  return Array.from({ length: points }, () => ({
    x: 20 + Math.random() * 80,
    y: 20 + Math.random() * 80,
  }));
};

/**
 * Hook that regenerates the loading skeleton data on a fixed interval, so the
 * skeleton scatter keeps animating between shapes while the chart is loading.
 */
export function useLoadingData(isLoading: boolean, loadingPoints: number = LOADING_POINTS) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, LOADING_ANIMATION_DURATION);

    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingData = useMemo(
    () => generateLoadingData(loadingPoints),
    // refreshKey toggle triggers re-computation each animation cycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingPoints, refreshKey],
  );

  return loadingData;
}

/** Animated placeholder points shown while real data is loading. */
const LoadingScatter = ({ data }: { data: { x: number; y: number }[] }) => {
  return (
    <RechartsScatter
      data={data}
      fill="currentColor"
      fillOpacity={0.25}
      shape={(props) => {
        const { cx, cy } = props;
        if (cx === undefined || cy === undefined) return <></>;
        return <circle cx={cx} cy={cy} r={4} fill="currentColor" fillOpacity={0.35} />;
      }}
      isAnimationActive
      animationDuration={LOADING_ANIMATION_DURATION}
      animationEasing="ease-in-out"
      legendType="none"
      tooltipType="none"
    />
  );
};
