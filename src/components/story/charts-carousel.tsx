import { NQCHART_GALLERY } from "./nqchart-gallery";
import { SpecimenCarousel, type Specimen } from "./specimen-carousel";

const ITEMS: Specimen[] = NQCHART_GALLERY.map((chart) => ({
  id: chart.id,
  name: chart.name,
  component: chart.component,
  blurb: chart.blurb,
  tags: chart.settings,
  Render: chart.render,
}));

export function ChartsCarousel() {
  return (
    <SpecimenCarousel
      items={ITEMS}
      label="chart types"
      bodyClassName="h-[280px]"
    />
  );
}
