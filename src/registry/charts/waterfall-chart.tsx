"use client";

import {
  type ChartConfig,
  ChartContainer,
  getColorsCount,
  getLoadingData,
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
import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type FC,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { motion } from "motion/react";

const LOADING_ANIMATION_DURATION = 2000;
const BASE_STACK_ID = "evil-waterfall-base";
const LOADING_BAR_COUNT = 6;

export type WaterfallType = "start" | "increase" | "decrease" | "total";

type WaterfallDatum = Record<string, unknown> & {
  base?: number;
  barValue?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared state for every part of the chart. Lifted into <EvilWaterfallChart /> so that
 * <Bars />, <Tooltip />, <Legend />, and friends can read it without prop drilling.
 */
type WaterfallChartContextValue = {
  config: ChartConfig;
  data: WaterfallDatum[];
  nameKey: string;
  valueKey: string;
  typeKey: string;
  chartId: string;
  isLoading: boolean;
  selectedBar: string | null;
  selectBar: (barName: string | null) => void;
  isClickable: boolean;
  glowingBars: string[];
  barRadius: number;
};

const WaterfallChartContext = createContext<WaterfallChartContextValue | null>(null);

/** Reads the chart context, throwing a helpful error when used outside <EvilWaterfallChart />. */
function useWaterfallChart() {
  const context = use(WaterfallChartContext);

  if (!context) {
    throw new Error(
      "Waterfall chart parts (<Bars />, <Tooltip />, …) must be used within <EvilWaterfallChart />",
    );
  }

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root container
// ─────────────────────────────────────────────────────────────────────────────

type EvilWaterfallChartProps<TData extends Record<string, unknown>> = {
  config: ChartConfig;
  data: TData[];
  nameKey: keyof TData & string;
  valueKey: keyof TData & string;
  typeKey?: keyof TData & string;
  children: ReactNode;
  className?: string;
  barRadius?: number;
  backgroundVariant?: BackgroundVariant;
  defaultSelectedBar?: string | null;
  onSelectionChange?: (selection: { dataKey: string; value: number } | null) => void;
  isLoading?: boolean;
  loadingBars?: number;
  chartProps?: ComponentProps<typeof RechartsBarChart>;
};

/**
 * Root of the composible waterfall chart. Owns the bridge data, the shared context,
 * and the loading skeleton. Everything visual is composed as children.
 */
export function EvilWaterfallChart<TData extends Record<string, unknown>>({
  config,
  data,
  nameKey,
  valueKey,
  typeKey = "type",
  children,
  className,
  barRadius = 4,
  backgroundVariant,
  defaultSelectedBar = null,
  onSelectionChange,
  isLoading = false,
  loadingBars = 6,
  chartProps,
}: EvilWaterfallChartProps<TData>) {
  const chartId = useId().replace(/:/g, "");
  const [selectedBar, setSelectedBar] = useState<string | null>(defaultSelectedBar);
  const barsConfig = useMemo(() => resolveBarsConfig(children), [children]);
  const chartParts = useMemo(() => resolveWaterfallParts(children), [children]);

  const preparedData = useMemo(
    () => (isLoading ? buildLoadingWaterfallData(loadingBars, nameKey, valueKey) : prepareWaterfallData(data, valueKey, typeKey)),
    [data, isLoading, loadingBars, nameKey, valueKey, typeKey],
  );

  const selectBar = useCallback(
    (barName: string | null) => {
      setSelectedBar(barName);

      if (barName === null) {
        onSelectionChange?.(null);
        return;
      }

      const row = preparedData.find((item) => String(item[nameKey]) === barName);
      onSelectionChange?.(
        row ? { dataKey: barName, value: Number(row[valueKey] ?? row.barValue ?? 0) } : null,
      );
    },
    [preparedData, nameKey, onSelectionChange, valueKey],
  );

  const contextValue = useMemo<WaterfallChartContextValue>(
    () => ({
      config,
      data: preparedData,
      nameKey,
      valueKey,
      typeKey,
      chartId,
      isLoading,
      selectedBar,
      selectBar,
      isClickable: barsConfig.isClickable,
      glowingBars: barsConfig.glowingBars,
      barRadius,
    }),
    [
      config,
      preparedData,
      nameKey,
      valueKey,
      typeKey,
      chartId,
      isLoading,
      selectedBar,
      selectBar,
      barsConfig.isClickable,
      barsConfig.glowingBars,
      barRadius,
    ],
  );

  return (
    <WaterfallChartContext value={contextValue}>
      <ChartContainer className={className} config={config}>
        <LoadingIndicator isLoading={isLoading} />
        <RechartsBarChart
          id={chartId}
          accessibilityLayer
          data={preparedData}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          {...chartProps}
        >
          {backgroundVariant && <ChartBackground variant={backgroundVariant} />}
          <ReferenceLine y={0} stroke="var(--border)" />
          {chartParts}
          <RechartsBar
            dataKey="base"
            stackId={BASE_STACK_ID}
            fill="transparent"
            isAnimationActive={false}
            radius={0}
          />
          <RechartsBar
            dataKey="barValue"
            stackId={BASE_STACK_ID}
            isAnimationActive={false}
            shape={(props) => <WaterfallBarShape {...props} />}
          />
          <defs>
            <BarColorGradients chartId={chartId} config={config} data={preparedData} nameKey={nameKey} />
            {barsConfig.glowingBars.length > 0 && (
              <BarGlowFilters chartId={chartId} glowingBars={barsConfig.glowingBars} />
            )}
          </defs>
        </RechartsBarChart>
      </ChartContainer>
    </WaterfallChartContext>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composible parts
// ─────────────────────────────────────────────────────────────────────────────

type BarsProps = {
  isClickable?: boolean;
  glowingBars?: string[];
};

/**
 * Configuration slot for waterfall bar behavior. The root reads its props and
 * wires them into the bar renderer — it renders nothing on its own.
 */
export const Bars: FC<BarsProps> = () => null;

type TooltipProps = {
  variant?: TooltipVariant;
  roundness?: TooltipRoundness;
  defaultIndex?: number;
};

/** The hover tooltip. Hidden automatically while the chart is loading. */
export function Tooltip({ variant, roundness, defaultIndex }: TooltipProps) {
  const { isLoading, selectedBar, nameKey } = useWaterfallChart();

  if (isLoading) return null;

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={{ fill: "var(--muted)", fillOpacity: 0.25 }}
      content={
        <ChartTooltipContent
          selected={selectedBar}
          nameKey={nameKey}
          roundness={roundness}
          variant={variant}
        />
      }
    />
  );
}

type LegendProps = {
  variant?: ChartLegendVariant;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  isClickable?: boolean;
};

/**
 * The bar legend. When `isClickable` is set, each entry toggles selection of
 * its bar, driving the shared selection state read by every bar.
 */
export function Legend({
  variant,
  align = "right",
  verticalAlign = "top",
  isClickable = false,
}: LegendProps) {
  const { isLoading, nameKey, selectedBar, selectBar } = useWaterfallChart();

  if (isLoading) return null;

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedBar}
          onSelectChange={selectBar}
          isClickable={isClickable}
          nameKey={nameKey}
          variant={variant}
        />
      }
    />
  );
}

type GridProps = ComponentProps<typeof CartesianGrid>;

/** The background grid lines. Defaults to horizontal-only dashed lines. */
export function Grid({ vertical = false, strokeDasharray = "3 3", ...props }: GridProps) {
  const { isLoading } = useWaterfallChart();
  if (isLoading) return null;
  return <CartesianGrid vertical={vertical} strokeDasharray={strokeDasharray} {...props} />;
}

type XAxisProps = ComponentProps<typeof RechartsXAxis>;

/** The category axis listing each waterfall step. */
export function XAxis({
  type = "category",
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  ...props
}: XAxisProps) {
  const { isLoading, nameKey } = useWaterfallChart();
  if (isLoading) return null;
  return (
    <RechartsXAxis
      type={type}
      dataKey={nameKey}
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      {...props}
    />
  );
}

type YAxisProps = ComponentProps<typeof RechartsYAxis>;

/** The value axis. Defaults to a numeric scale. */
export function YAxis({
  type = "number",
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  width = "auto",
  ...props
}: YAxisProps) {
  const { isLoading } = useWaterfallChart();
  if (isLoading) return null;
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

// ─────────────────────────────────────────────────────────────────────────────
// Bar shape
// ─────────────────────────────────────────────────────────────────────────────

type WaterfallBarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: WaterfallDatum;
  index?: number;
};

const WaterfallBarShape = (props: WaterfallBarShapeProps) => {
  const {
    chartId,
    nameKey,
    isLoading,
    isClickable,
    glowingBars,
    selectedBar,
    selectBar,
    barRadius,
  } = useWaterfallChart();

  const { x = 0, y = 0, width = 0, height = 0, payload, index = 0 } = props;
  if (!payload || width <= 0 || Math.abs(height) <= 0) return null;

  const barName = String(payload[nameKey]);
  const isGlowing = glowingBars.includes(barName);
  const isDimmed = selectedBar !== null && selectedBar !== barName;
  const fill = `url(#${chartId}-colors-${barName})`;
  const rectY = height < 0 ? y + height : y;
  const rectHeight = Math.abs(height);

  const bar = (
    <rect
      x={x}
      y={rectY}
      width={width}
      height={rectHeight}
      rx={barRadius}
      ry={barRadius}
      fill={fill}
      fillOpacity={isDimmed ? 0.3 : 1}
      filter={isGlowing ? `url(#${chartId}-glow-${barName})` : undefined}
      className="transition-opacity duration-200"
      style={isClickable ? { cursor: "pointer" } : undefined}
      onClick={() => {
        if (!isClickable || isLoading) return;
        selectBar(selectedBar === barName ? null : barName);
      }}
    />
  );

  if (isLoading) {
    return (
      <motion.rect
        x={x}
        y={rectY}
        width={width}
        height={rectHeight}
        rx={barRadius}
        fill="currentColor"
        fillOpacity={0.25}
        initial={{ opacity: 0.2 }}
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{
          duration: LOADING_ANIMATION_DURATION / 1000,
          delay: (index / LOADING_BAR_COUNT) * 0.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  return bar;
};

const BarColorGradients = ({
  chartId,
  config,
  data,
  nameKey,
}: {
  chartId: string;
  config: ChartConfig;
  data: WaterfallDatum[];
  nameKey: string;
}) => (
  <>
    {data.map((row) => {
      const barName = String(row[nameKey]);
      const barConfig = config[barName];
      if (!barConfig) return null;

      const colorsCount = getColorsCount(barConfig);

      return (
        <linearGradient
          key={`${chartId}-colors-${barName}`}
          id={`${chartId}-colors-${barName}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          {colorsCount === 1 ? (
            <>
              <stop offset="0%" stopColor={`var(--color-${barName}-0)`} />
              <stop offset="100%" stopColor={`var(--color-${barName}-0)`} />
            </>
          ) : (
            Array.from({ length: colorsCount }, (_, index) => {
              const offset = `${(index / (colorsCount - 1)) * 100}%`;
              return (
                <stop
                  key={offset}
                  offset={offset}
                  stopColor={`var(--color-${barName}-${index}, var(--color-${barName}-0))`}
                />
              );
            })
          )}
        </linearGradient>
      );
    })}
  </>
);

const BarGlowFilters = ({
  chartId,
  glowingBars,
}: {
  chartId: string;
  glowingBars: string[];
}) => (
  <>
    {glowingBars.map((barName) => (
      <filter
        key={`${chartId}-glow-${barName}`}
        id={`${chartId}-glow-${barName}`}
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0"
          result="glow"
        />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    ))}
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Data helpers
// ─────────────────────────────────────────────────────────────────────────────

const prepareWaterfallData = <TData extends Record<string, unknown>>(
  data: TData[],
  valueKey: string,
  typeKey: string,
): WaterfallDatum[] => {
  let running = 0;

  return data.map((row) => {
    const value = Number(row[valueKey] ?? 0);
    const type = String(row[typeKey] ?? "increase") as WaterfallType;

    if (type === "start") {
      running = value;
      return { ...row, base: 0, barValue: value };
    }

    if (type === "total") {
      return { ...row, base: 0, barValue: value };
    }

    if (type === "decrease") {
      running += value;
      return { ...row, base: running, barValue: Math.abs(value) };
    }

    const base = running;
    running += value;
    return { ...row, base, barValue: value };
  });
};

const buildLoadingWaterfallData = (count: number, nameKey: string, valueKey: string) =>
  getLoadingData(count, 20, 80).map((row, index) => ({
    [nameKey]: `loading-${index}`,
    [valueKey]: row.loading,
    type: "increase",
    base: index * 12,
    barValue: row.loading,
  }));

const resolveBarsConfig = (children: ReactNode) => {
  let isClickable = false;
  let glowingBars: string[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== Bars) return;

    const props = (child as ReactElement<BarsProps>).props;
    isClickable = props.isClickable ?? false;
    glowingBars = props.glowingBars ?? [];
  });

  return { isClickable, glowingBars };
};

const resolveWaterfallParts = (children: ReactNode) => {
  const parts: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Bars) return;
    parts.push(child);
  });

  return parts;
};
