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
} from "recharts";
import { motion } from "motion/react";

const LOADING_STAGES = 5;
const LOADING_ANIMATION_DURATION = 2000;
const DEFAULT_STAGE_GAP = 2;

type FunnelDatum = Record<string, unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// Shared context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared state for every part of the chart. Lifted into <EvilFunnelChart /> so that
 * <Stages />, <Tooltip />, <Legend />, and friends can read it without prop drilling.
 */
type FunnelChartContextValue = {
  config: ChartConfig;
  data: FunnelDatum[];
  stageKey: string;
  valueKey: string;
  chartId: string;
  maxValue: number;
  stageGap: number;
  isLoading: boolean;
  selectedStage: string | null;
  selectStage: (stageName: string | null) => void;
  isClickable: boolean;
  glowingStages: string[];
};

const FunnelChartContext = createContext<FunnelChartContextValue | null>(null);

/** Reads the chart context, throwing a helpful error when used outside <EvilFunnelChart />. */
function useFunnelChart() {
  const context = use(FunnelChartContext);

  if (!context) {
    throw new Error(
      "Funnel chart parts (<Stages />, <Tooltip />, …) must be used within <EvilFunnelChart />",
    );
  }

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root container
// ─────────────────────────────────────────────────────────────────────────────

type EvilFunnelChartProps<TData extends FunnelDatum> = {
  config: ChartConfig;
  data: TData[];
  stageKey: keyof TData & string;
  valueKey: keyof TData & string;
  children: ReactNode;
  className?: string;
  stageGap?: number;
  backgroundVariant?: BackgroundVariant;
  defaultSelectedStage?: string | null;
  onSelectionChange?: (selection: { dataKey: string; value: number } | null) => void;
  isLoading?: boolean;
  loadingStages?: number;
  chartProps?: ComponentProps<typeof RechartsBarChart>;
};

/**
 * Root of the composible funnel chart. Owns the stage data, the shared context,
 * and the loading skeleton. Everything visual is composed as children.
 */
export function EvilFunnelChart<TData extends FunnelDatum>({
  config,
  data,
  stageKey,
  valueKey,
  children,
  className,
  stageGap = DEFAULT_STAGE_GAP,
  backgroundVariant,
  defaultSelectedStage = null,
  onSelectionChange,
  isLoading = false,
  loadingStages = LOADING_STAGES,
  chartProps,
}: EvilFunnelChartProps<TData>) {
  const chartId = useId().replace(/:/g, "");
  const [selectedStage, setSelectedStage] = useState<string | null>(defaultSelectedStage);
  const stagesConfig = useMemo(() => resolveStagesConfig(children), [children]);
  const chartParts = useMemo(() => resolveFunnelParts(children), [children]);

  const loadingData = useMemo(
    () =>
      getLoadingData(loadingStages, 35, 95).map((row, index) => ({
        [stageKey]: `loading-${index}`,
        [valueKey]: row.loading,
      })),
    [loadingStages, stageKey, valueKey],
  );

  const displayData = isLoading ? loadingData : data;
  const maxValue = useMemo(
    () => Math.max(...displayData.map((row) => Number(row[valueKey] ?? 0)), 1),
    [displayData, valueKey],
  );

  const selectStage = useCallback(
    (stageName: string | null) => {
      setSelectedStage(stageName);

      if (stageName === null) {
        onSelectionChange?.(null);
        return;
      }

      const row = data.find((item) => String(item[stageKey]) === stageName);
      onSelectionChange?.(
        row ? { dataKey: stageName, value: Number(row[valueKey] ?? 0) } : null,
      );
    },
    [data, onSelectionChange, stageKey, valueKey],
  );

  const contextValue = useMemo<FunnelChartContextValue>(
    () => ({
      config,
      data: displayData,
      stageKey,
      valueKey,
      chartId,
      maxValue,
      stageGap,
      isLoading,
      selectedStage,
      selectStage,
      isClickable: stagesConfig.isClickable,
      glowingStages: stagesConfig.glowingStages,
    }),
    [
      config,
      displayData,
      stageKey,
      valueKey,
      chartId,
      maxValue,
      stageGap,
      isLoading,
      selectedStage,
      selectStage,
      stagesConfig,
    ],
  );

  return (
    <FunnelChartContext value={contextValue}>
      <ChartContainer className={className} config={config}>
        <LoadingIndicator isLoading={isLoading} />
        <RechartsBarChart
          id={chartId}
          accessibilityLayer
          layout="vertical"
          data={displayData}
          barCategoryGap={0}
          barGap={0}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          {...chartProps}
        >
          {backgroundVariant && <ChartBackground variant={backgroundVariant} />}
          {chartParts}
          <RechartsBar
            dataKey={valueKey as string}
            isAnimationActive={false}
            background={{ fill: "transparent" }}
            shape={(props) => <FunnelStageShape {...(props as FunnelShapeProps)} />}
          />
          <defs>
            <StageColorGradients
              chartId={chartId}
              config={config}
              data={displayData}
              stageKey={stageKey}
            />
            {stagesConfig.glowingStages.length > 0 && (
              <StageGlowFilters chartId={chartId} glowingStages={stagesConfig.glowingStages} />
            )}
          </defs>
        </RechartsBarChart>
      </ChartContainer>
    </FunnelChartContext>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composible parts
// ─────────────────────────────────────────────────────────────────────────────

type StagesProps = {
  isClickable?: boolean;
  glowingStages?: string[];
};

/**
 * Configuration slot for funnel stage behavior. The root reads its props and
 * wires them into the stage renderer — it renders nothing on its own.
 */
export const Stages: FC<StagesProps> = () => null;

type TooltipProps = {
  variant?: TooltipVariant;
  roundness?: TooltipRoundness;
  defaultIndex?: number;
};

/** The hover tooltip. Hidden automatically while the chart is loading. */
export function Tooltip({ variant, roundness, defaultIndex }: TooltipProps) {
  const { isLoading, selectedStage, stageKey } = useFunnelChart();

  if (isLoading) return null;

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={false}
      content={
        <ChartTooltipContent
          selected={selectedStage}
          nameKey={stageKey}
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
 * The stage legend. When `isClickable` is set, each entry toggles selection of
 * its stage, driving the shared selection state read by every stage.
 */
export function Legend({
  variant,
  align = "center",
  verticalAlign = "bottom",
  isClickable = false,
}: LegendProps) {
  const { isLoading, stageKey, selectedStage, selectStage } = useFunnelChart();

  if (isLoading) return null;

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedStage}
          onSelectChange={selectStage}
          isClickable={isClickable}
          nameKey={stageKey}
          variant={variant}
        />
      }
    />
  );
}

type GridProps = ComponentProps<typeof CartesianGrid>;

/** Optional dashed grid lines behind the funnel. */
export function Grid({ strokeDasharray = "3 3", ...props }: GridProps) {
  const { isLoading } = useFunnelChart();
  if (isLoading) return null;
  return <CartesianGrid strokeDasharray={strokeDasharray} horizontal={false} {...props} />;
}

type XAxisProps = ComponentProps<typeof RechartsXAxis>;

/** The value axis. Hidden by default for a clean funnel silhouette. */
export function XAxis({ hide = true, type = "number", ...props }: XAxisProps) {
  const { isLoading } = useFunnelChart();
  if (isLoading) return null;
  return <RechartsXAxis type={type} hide={hide} axisLine={false} tickLine={false} {...props} />;
}

type YAxisProps = ComponentProps<typeof RechartsYAxis>;

/** The stage axis. Lists each funnel stage top-to-bottom. */
export function YAxis({
  type = "category",
  tickLine = false,
  axisLine = false,
  width = 96,
  ...props
}: YAxisProps) {
  const { isLoading, stageKey } = useFunnelChart();
  if (isLoading) return null;
  return (
    <RechartsYAxis
      type={type}
      dataKey={stageKey}
      tickLine={tickLine}
      axisLine={axisLine}
      width={width}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Funnel shape
// ─────────────────────────────────────────────────────────────────────────────

type FunnelShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: FunnelDatum;
  index?: number;
  background?: {
    x?: number | null;
    y?: number | null;
    width?: number | null;
    height?: number | null;
  };
};

const FunnelStageShape = (props: FunnelShapeProps) => {
  const {
    chartId,
    data,
    stageKey,
    valueKey,
    maxValue,
    stageGap,
    isLoading,
    isClickable,
    glowingStages,
    selectedStage,
    selectStage,
  } = useFunnelChart();

  const { x = 0, y = 0, width = 0, height = 0, payload, index = 0, background } = props;
  if (!payload || height <= 0) return null;

  const stageName = String(payload[stageKey]);
  const value = Number(payload[valueKey] ?? 0);
  const nextValue =
    index < data.length - 1
      ? Number(data[index + 1]?.[valueKey] ?? 0)
      : Math.max(value * 0.65, 1);

  // Recharts sizes each bar by value (width grows with the stage count), which
  // mis-centers trapezoids. The category background spans the full plot width —
  // use it so every stage shares one vertical center line.
  const plotX = background?.x ?? x;
  const plotWidth = background?.width ?? width;
  if (plotWidth == null || plotWidth <= 0) return null;

  const centerX = (plotX ?? 0) + plotWidth / 2;
  const topWidth = (value / maxValue) * plotWidth;
  const bottomWidth = (nextValue / maxValue) * plotWidth;
  const isFirst = index === 0;
  const isLast = index === data.length - 1;
  const topY = y + (isFirst ? stageGap / 2 : 0);
  const bottomY = y + height - (isLast ? stageGap / 2 : 0);
  const topLeft = centerX - topWidth / 2;
  const topRight = centerX + topWidth / 2;
  const bottomLeft = centerX - bottomWidth / 2;
  const bottomRight = centerX + bottomWidth / 2;

  const isGlowing = glowingStages.includes(stageName);
  const isDimmed = selectedStage !== null && selectedStage !== stageName;
  const fill = `url(#${chartId}-colors-${stageName})`;
  const path = `M ${topLeft} ${topY} L ${topRight} ${topY} L ${bottomRight} ${bottomY} L ${bottomLeft} ${bottomY} Z`;

  const shape = (
    <path
      d={path}
      fill={fill}
      fillOpacity={isDimmed ? 0.3 : 1}
      filter={isGlowing ? `url(#${chartId}-glow-${stageName})` : undefined}
      className="transition-opacity duration-200"
      style={isClickable ? { cursor: "pointer" } : undefined}
      onClick={() => {
        if (!isClickable || isLoading) return;
        selectStage(selectedStage === stageName ? null : stageName);
      }}
    />
  );

  if (isLoading) {
    return (
      <motion.g
        initial={{ opacity: 0.2 }}
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{
          duration: LOADING_ANIMATION_DURATION / 1000,
          delay: (index / LOADING_STAGES) * 0.25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <path d={path} fill="currentColor" fillOpacity={0.25} />
      </motion.g>
    );
  }

  return shape;
};

const StageColorGradients = ({
  chartId,
  config,
  data,
  stageKey,
}: {
  chartId: string;
  config: ChartConfig;
  data: FunnelDatum[];
  stageKey: string;
}) => (
  <>
    {data.map((row) => {
      const stageName = String(row[stageKey]);
      const stageConfig = config[stageName];
      if (!stageConfig) return null;

      const colorsCount = getColorsCount(stageConfig);

      return (
        <linearGradient
          key={`${chartId}-colors-${stageName}`}
          id={`${chartId}-colors-${stageName}`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          {colorsCount === 1 ? (
            <>
              <stop offset="0%" stopColor={`var(--color-${stageName}-0)`} />
              <stop offset="100%" stopColor={`var(--color-${stageName}-0)`} />
            </>
          ) : (
            Array.from({ length: colorsCount }, (_, index) => {
              const offset = `${(index / (colorsCount - 1)) * 100}%`;
              return (
                <stop
                  key={offset}
                  offset={offset}
                  stopColor={`var(--color-${stageName}-${index}, var(--color-${stageName}-0))`}
                />
              );
            })
          )}
        </linearGradient>
      );
    })}
  </>
);

const StageGlowFilters = ({
  chartId,
  glowingStages,
}: {
  chartId: string;
  glowingStages: string[];
}) => (
  <>
    {glowingStages.map((stageKey) => (
      <filter
        key={`${chartId}-glow-${stageKey}`}
        id={`${chartId}-glow-${stageKey}`}
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

const resolveStagesConfig = (children: ReactNode) => {
  let isClickable = false;
  let glowingStages: string[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== Stages) return;

    const props = (child as ReactElement<StagesProps>).props;
    isClickable = props.isClickable ?? false;
    glowingStages = props.glowingStages ?? [];
  });

  return { isClickable, glowingStages };
};

const resolveFunnelParts = (children: ReactNode) => {
  const parts: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Stages) return;
    parts.push(child);
  });

  return parts;
};
