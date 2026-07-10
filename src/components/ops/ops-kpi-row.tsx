import { buildKpiTiles } from "../../data/ops-aggregates";
import { OpsKpiTile } from "./ops-kpi-tile";

export function OpsKpiRow() {
  const tiles = buildKpiTiles();

  return (
    <section aria-label="Key metrics" className="grid grid-cols-12 gap-4">
      {tiles.map((tile) => (
        <div key={tile.id} className="col-span-12 sm:col-span-6 xl:col-span-3">
          <OpsKpiTile tile={tile} />
        </div>
      ))}
    </section>
  );
}
