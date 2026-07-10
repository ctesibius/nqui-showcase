import { Chapter } from "./chapter";
import { Reveal } from "./motion-primitives";
import { SpecimenCarousel } from "./specimen-carousel";
import { NQUI_GALLERY } from "./nqui-gallery";

export function NquiChapter() {
  return (
    <Chapter
      id="components"
      eyebrow="nqui — component library"
      headline="Every component, considered."
      lede="Buttons, forms, overlays and lists that hold up in real products. Version 0.7.0 cuts the core to 26 dependencies and moves the heavy pieces to subpath entries — you ship only what you import."
    >
      <Reveal>
        <SpecimenCarousel
          items={NQUI_GALLERY}
          label="component groups"
          bodyClassName="flex min-h-[300px] items-center"
        />
      </Reveal>
    </Chapter>
  );
}
