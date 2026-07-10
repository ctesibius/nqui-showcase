/* eslint-disable react-refresh/only-export-components -- shared PEOPLE data lives next to the AvatarStack that consumes it. */
import { Avatar, AvatarFallback, AvatarImage } from "@nqlib/nqui";

export interface Person {
  name: string;
  initials: string;
  img: string;
}

/** A shared cast of fake people (photos from pravatar, initials as fallback). */
export const PEOPLE: Person[] = [
  { name: "Mai Khuong", initials: "MK", img: "https://i.pravatar.cc/120?img=47" },
  { name: "Thanh Ngo", initials: "TN", img: "https://i.pravatar.cc/120?img=12" },
  { name: "Anna Liu", initials: "AL", img: "https://i.pravatar.cc/120?img=32" },
  { name: "Rafael Vega", initials: "RV", img: "https://i.pravatar.cc/120?img=15" },
  { name: "Sofia Marín", initials: "SM", img: "https://i.pravatar.cc/120?img=45" },
];

/**
 * Overlapping avatar stack where hovering (or focusing) a face pops it forward —
 * it lifts, scales, rises above its neighbours, and reveals a name chip.
 */
export function AvatarStack({
  people = PEOPLE,
  size = "size-9",
  extra,
}: {
  people?: Person[];
  size?: string;
  extra?: number;
}) {
  return (
    <div className="flex -space-x-2.5">
      {people.map((p, i) => (
        <div key={p.name} className="group relative" style={{ zIndex: people.length - i }}>
          <Avatar
            tabIndex={0}
            className={`${size} cursor-pointer rounded-full ring-2 ring-background transition-transform duration-200 ease-out will-change-transform group-hover:z-30 group-hover:-translate-y-1.5 group-hover:scale-[1.15] group-focus-visible:-translate-y-1.5 group-focus-visible:scale-[1.15]`}
          >
            <AvatarImage src={p.img} alt={p.name} />
            <AvatarFallback className="text-xs">{p.initials}</AvatarFallback>
          </Avatar>
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-sm transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            {p.name}
          </span>
        </div>
      ))}
      {extra ? (
        <Avatar className={`${size} ring-2 ring-background`}>
          <AvatarFallback className="text-xs text-muted-foreground">+{extra}</AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  );
}
