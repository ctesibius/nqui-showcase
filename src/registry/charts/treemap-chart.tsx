"use client";

import {
  type ChartConfig,
  ChartContainer,
  getColorsCount,
  LoadingIndicator,
} from "@/registry/ui/chart";
import { ChartLegend, ChartLegendContent, type ChartLegendVariant } from "@/registry/ui/legend";
import {
  ChartTooltip,
  ChartTooltipContent,
  type TooltipRoundness,
  type TooltipVariant,
} from "@/registry/ui/tooltip";
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
  type FC,
  type ReactElement,
  type ReactNode,
} from "react";
import { Treemap as RechartsTreemap, type TreemapProps } from "recharts";
import { motion } from "motion/react";

const LOADING_TILES = 8;
const LOADING_ANIMATION_DURATION = 2000;
const DEFAULT_ASPECT_RATIO = 4 / 3;
const DEFAULT_STROKE_WIDTH = 2;

export type TreemapNode = {
  name: string;
  size?: number;
  children?: TreemapNode[];
  [key: string]: unknown;
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared state for every part of the chart. Lifted into <EvilTreemapChart /> so that
 * <Tiles />, <Tooltip />, <Legend />, and friends can read it without prop drilling.
 */
type TreemapChartContextValue = {
  config: ChartConfig;
  data: TreemapNode[];
  dataKey: string;
  nameKey: string;
  chartId: string;
  aspectRatio: number;
  strokeWidth: number;
  isLoading: boolean;
  selectedTile: string | null;
  selectTile: (tileName: string | null) => void;
  isClickable: boolean;
  glowingTiles: string[];
  showLabels: boolean;
};

const TreemapChartContext = createContext<TreemapChartContextValue | null>(null);

/** Reads the chart context, throwing a helpful error when used outside <EvilTreemapChart />. */
function useTreemapChart() {
  const context = use(TreemapChartContext);

  if (!context) {
    throw new Error(
      "Treemap chart parts (<Tiles />, <Tooltip />, …) must be used within <EvilTreemapChart />",
    );
  }

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root container
// ─────────────────────────────────────────────────────────────────────────────

type EvilTreemapChartProps = {
  config: ChartConfig;
  data: TreemapNode[];
  dataKey?: string;
  nameKey?: string;
  children: ReactNode;
  className?: string;
  aspectRatio?: number;
  strokeWidth?: number;
  backgroundVariant?: BackgroundVariant;
  defaultSelectedTile?: string | null;
  onSelectionChange?: (selection: { dataKey: string; value: number } | null) => void;
  isLoading?: boolean;
  treemapProps?: Omit<TreemapProps, "data" | "dataKey">;
};

/**
 * Root of the composible treemap chart. Owns the hierarchical data, the shared
 * context, and the loading skeleton. Everything visual is composed as children.
 */
export function EvilTreemapChart({
  config,
  data,
  dataKey = "size",
  nameKey = "name",
  children,
  className,
  aspectRatio = DEFAULT_ASPECT_RATIO,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  backgroundVariant,
  defaultSelectedTile = null,
  onSelectionChange,
  isLoading = false,
  treemapProps,
}: EvilTreemapChartProps) {
  const chartId = useId().replace(/:/g, "");
  const [selectedTile, setSelectedTile] = useState<string | null>(defaultSelectedTile);
  const tilesConfig = useMemo(() => resolveTilesConfig(children), [children]);

  const selectTile = useCallback(
    (tileName: string | null) => {
      setSelectedTile(tileName);

      if (tileName === null) {
        onSelectionChange?.(null);
        return;
      }

      const value = findNodeValue(data, tileName, dataKey, nameKey);
      onSelectionChange?.({ dataKey: tileName, value });
    },
    [data, dataKey, nameKey, onSelectionChange],
  );

  const contextValue = useMemo<TreemapChartContextValue>(
    () => ({
      config,
      data,
      dataKey,
      nameKey,
      chartId,
      aspectRatio,
      strokeWidth,
      isLoading,
      selectedTile,
      selectTile,
      isClickable: tilesConfig.isClickable,
      glowingTiles: tilesConfig.glowingTiles,
      showLabels: tilesConfig.showLabels,
    }),
    [
      config,
      data,
      dataKey,
      nameKey,
      chartId,
      aspectRatio,
      strokeWidth,
      isLoading,
      selectedTile,
      selectTile,
      tilesConfig.isClickable,
      tilesConfig.glowingTiles,
      tilesConfig.showLabels,
    ],
  );

  const chartParts = useMemo(() => resolveTreemapParts(children), [children]);

  return (
    <TreemapChartContext value={contextValue}>
      <ChartContainer className={className} config={config}>
        <LoadingIndicator isLoading={isLoading} />
        {backgroundVariant && <ChartBackground variant={backgroundVariant} />}
        {!isLoading ? (
          <RechartsTreemap
            id={chartId}
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            aspectRatio={aspectRatio}
            stroke="var(--background)"
            content={<TreemapTileContent />}
            {...treemapProps}
          >
            {chartParts}
            <defs>
              <TileColorGradients chartId={chartId} config={config} />
              {tilesConfig.glowingTiles.length > 0 && (
                <TileGlowFilters chartId={chartId} glowingTiles={tilesConfig.glowingTiles} />
              )}
            </defs>
          </RechartsTreemap>
        ) : (
          <LoadingTreemap />
        )}
      </ChartContainer>
    </TreemapChartContext>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composible parts
// ─────────────────────────────────────────────────────────────────────────────

type TilesProps = {
  isClickable?: boolean;
  glowingTiles?: string[];
  showLabels?: boolean;
};

/**
 * Configuration slot for treemap tile behavior. The root reads its props and
 * wires them into the tile renderer — it renders nothing on its own.
 */
export const Tiles: FC<TilesProps> = () => null;

type TooltipProps = {
  variant?: TooltipVariant;
  roundness?: TooltipRoundness;
  defaultIndex?: number;
};

/** The hover tooltip. Hidden automatically while the chart is loading. */
export function Tooltip({ variant, roundness, defaultIndex }: TooltipProps) {
  const { isLoading, nameKey } = useTreemapChart();

  if (isLoading) return null;

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      content={
        <ChartTooltipContent nameKey={nameKey} hideLabel roundness={roundness} variant={variant} />
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
 * The tile legend. When `isClickable` is set, each entry toggles selection of
 * its tile, driving the shared selection state read by every tile.
 */
export function Legend({
  variant,
  align = "center",
  verticalAlign = "bottom",
  isClickable = false,
}: LegendProps) {
  const { isLoading, nameKey, selectedTile, selectTile } = useTreemapChart();

  if (isLoading) return null;

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedTile}
          onSelectChange={selectTile}
          isClickable={isClickable}
          nameKey={nameKey}
          variant={variant}
        />
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tile renderer
// ─────────────────────────────────────────────────────────────────────────────

type TreemapContentProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  index?: number;
  depth?: number;
};

const TreemapTileContent = (props: TreemapContentProps) => {
  const {
    config,
    chartId,
    isClickable,
    glowingTiles,
    showLabels,
    selectedTile,
    selectTile,
    strokeWidth,
  } = useTreemapChart();

  const { x = 0, y = 0, width = 0, height = 0, name = "", depth = 0 } = props;

  if (width <= 0 || height <= 0 || depth === 0) return null;

  const tileKey = String(name);
  const isGlowing = glowingTiles.includes(tileKey);
  const isDimmed = selectedTile !== null && selectedTile !== tileKey;
  const fill = `url(#${chartId}-colors-${tileKey})`;

  return (
    <g
      className={isClickable ? "cursor-pointer" : undefined}
      onClick={() => {
        if (!isClickable) return;
        selectTile(selectedTile === tileKey ? null : tileKey);
      }}
    >
      <rect
        x={x + strokeWidth / 2}
        y={y + strokeWidth / 2}
        width={Math.max(0, width - strokeWidth)}
        height={Math.max(0, height - strokeWidth)}
        rx={4}
        ry={4}
        fill={fill}
        fillOpacity={isDimmed ? 0.3 : 1}
        filter={isGlowing ? `url(#${chartId}-glow-${tileKey})` : undefined}
        className="transition-opacity duration-200"
      />
      {showLabels && width > 36 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
          className="fill-background pointer-events-none text-[10px] font-medium"
        >
          {config[tileKey]?.label ?? tileKey}
        </text>
      )}
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Style definitions
// ─────────────────────────────────────────────────────────────────────────────

const TileColorGradients = ({ chartId, config }: { chartId: string; config: ChartConfig }) => (
  <>
    {Object.entries(config).map(([tileKey, tileConfig]) => {
      const colorsCount = getColorsCount(tileConfig);

      return (
        <linearGradient
          key={`${chartId}-colors-${tileKey}`}
          id={`${chartId}-colors-${tileKey}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          {colorsCount === 1 ? (
            <>
              <stop offset="0%" stopColor={`var(--color-${tileKey}-0)`} />
              <stop offset="100%" stopColor={`var(--color-${tileKey}-0)`} />
            </>
          ) : (
            Array.from({ length: colorsCount }, (_, index) => {
              const offset = `${(index / (colorsCount - 1)) * 100}%`;
              return (
                <stop
                  key={offset}
                  offset={offset}
                  stopColor={`var(--color-${tileKey}-${index}, var(--color-${tileKey}-0))`}
                />
              );
            })
          )}
        </linearGradient>
      );
    })}
  </>
);

const TileGlowFilters = ({
  chartId,
  glowingTiles,
}: {
  chartId: string;
  glowingTiles: string[];
}) => (
  <>
    {glowingTiles.map((tileKey) => (
      <filter
        key={`${chartId}-glow-${tileKey}`}
        id={`${chartId}-glow-${tileKey}`}
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
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

const LOADING_TILE_LAYOUT = [
  { x: 0, y: 0, width: 55, height: 100 },
  { x: 55, y: 0, width: 45, height: 58 },
  { x: 55, y: 58, width: 22, height: 42 },
  { x: 77, y: 58, width: 23, height: 42 },
  { x: 0, y: 0, width: 30, height: 45 },
  { x: 30, y: 0, width: 25, height: 45 },
  { x: 0, y: 45, width: 55, height: 55 },
  { x: 55, y: 0, width: 45, height: 100 },
];

const LoadingTreemap = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    {LOADING_TILE_LAYOUT.slice(0, LOADING_TILES).map((tile, index) => (
      <motion.rect
        key={index}
        x={tile.x + 0.5}
        y={tile.y + 0.5}
        width={Math.max(0, tile.width - 1)}
        height={Math.max(0, tile.height - 1)}
        rx={2}
        fill="currentColor"
        fillOpacity={0.2}
        initial={{ opacity: 0.15 }}
        animate={{ opacity: [0.15, 0.45, 0.15] }}
        transition={{
          duration: LOADING_ANIMATION_DURATION / 1000,
          delay: (index / LOADING_TILES) * (LOADING_ANIMATION_DURATION / 1000),
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const resolveTilesConfig = (children: ReactNode) => {
  let isClickable = false;
  let glowingTiles: string[] = [];
  let showLabels = true;

  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== Tiles) return;

    const props = (child as ReactElement<TilesProps>).props;
    isClickable = props.isClickable ?? false;
    glowingTiles = props.glowingTiles ?? [];
    showLabels = props.showLabels ?? true;
  });

  return { isClickable, glowingTiles, showLabels };
};

const resolveTreemapParts = (children: ReactNode) => {
  const parts: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Tiles) return;
    parts.push(child);
  });

  return parts;
};

const findNodeValue = (
  nodes: TreemapNode[],
  name: string,
  dataKey: string,
  nameKey: string,
): number => {
  for (const node of nodes) {
    if (String(node[nameKey]) === name) {
      return Number(node[dataKey] ?? 0);
    }

    if (node.children?.length) {
      const nested = findNodeValue(node.children, name, dataKey, nameKey);
      if (nested > 0) return nested;
    }
  }

  return 0;
};
