/**
 * nqui Calendar as the gantt's date control.
 *
 * The library ships a native `<input type="date">` on purpose — a real calendar
 * widget pulls in `react-day-picker`, which every nqgantt consumer would pay
 * for whether or not they ever edit a date. nqui declares it an *optional*
 * peer for the same reason. The showcase already has it, so it supplies the
 * richer control through `renderDateEditor` instead of the library forcing it.
 */
import { Calendar } from "@nqlib/nqui/calendar";
import type { GanttDateEditorContext } from "@nqlib/nqgantt";

export function renderNquiDateEditor({
  value,
  onChange,
  min,
  max,
}: GanttDateEditorContext) {
  return (
    <Calendar
      mode="single"
      selected={value ?? undefined}
      defaultMonth={value ?? undefined}
      captionLayout="dropdown"
      // A range can't invert: the start picker is capped by the end and vice
      // versa, so the invalid state is unreachable rather than rejected after
      // the fact.
      disabled={
        min || max
          ? (day: Date) => (min ? day < min : false) || (max ? day > max : false)
          : undefined
      }
      onSelect={(day: Date | undefined) => {
        if (day) onChange(day);
      }}
      className="rounded-md border-0 p-0"
    />
  );
}
