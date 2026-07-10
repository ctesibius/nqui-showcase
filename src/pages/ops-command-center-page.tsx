import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@nqlib/nqui";
import { OpsKpiRow } from "../components/ops/ops-kpi-row";
import { OpsDeliveryTrendChart } from "../components/ops/ops-delivery-trend-chart";
import { OpsWorkloadChart } from "../components/ops/ops-workload-chart";
import { OpsOperateTabs } from "../components/ops/ops-operate-tabs";
import { OpsRightRail } from "../components/ops/ops-right-rail";

export function OpsCommandCenterPage() {
  const [params] = useSearchParams();
  const tab = params.get("tab");
  const showOverview = !tab || tab === "overview";

  if (tab === "schedule" || tab === "projects") {
    return (
      <div className="p-4">
        <OpsOperateTabs />
      </div>
    );
  }

  return (
    <div className="flex min-h-full gap-4 p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {showOverview ? (
          <>
            <OpsKpiRow />

            <section className="grid grid-cols-12 gap-4" aria-label="Analyze">
              <div className="col-span-12 lg:col-span-8">
                <OpsDeliveryTrendChart />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <OpsWorkloadChart />
              </div>
            </section>
          </>
        ) : null}

        <OpsOperateTabs />

        <footer className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
          <span>Q3 Delivery Program · nqlib showcase</span>
          <Button asChild variant="outline" size="sm">
            <Link to="/readme">Install docs</Link>
          </Button>
        </footer>
      </div>

      <div className="hidden xl:block">
        <OpsRightRail />
      </div>
    </div>
  );
}
