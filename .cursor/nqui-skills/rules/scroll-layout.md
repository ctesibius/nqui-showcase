# Scroll, flex height, and overflow (Card & containers)

Use this when **`ScrollArea`**, **`Card`**, **`Sheet` / `Drawer`**, **sidebar columns**, **dashboard grid cells**, or **`ResizablePanel`** content feels wrong: **scroll stuck**, **overflow past rounded corners**, **footer or toolbar overlapped**, **double scrollbars**, or **`h-full` / `%` height** never binding.

Canonical detail lives in **`node_modules/@nqlib/nqui/docs/components/nqui-scroll-area.md`** (layout pitfalls §1–§6). In-repo design rules: **`design-system.md` § Card + ScrollArea**. Tables: **`nqui-data-tables/SKILL.md`**.

---

## Symptom → likely cause → fix

### Scroll stuck (wheel / trackpad does nothing)

**Cause:** The scrollport never gets a **finite** block-size. In a **flex column**, children default to **`min-height: auto`**, so a **`flex-1`** region can **grow with content** instead of shrinking → no overflow → no scroll.

**Fix:**

- Add **`min-h-0`** (and usually **`min-w-0`**) on **every** flex ancestor from the page/panel root down to the element that should clip/scroll.
- On the **scroll slot** (often `ScrollArea` root), use **`min-h-0 flex-1`**; if blow-through persists, use **`h-0 max-h-full min-h-0 min-w-0 flex-1 overflow-hidden`** so flex assigns a definite main-axis size.

### Body grows over footer / actions below the card

**Cause:** Radix **viewport** or inner tree **sizes to content height** while the card shell looks short — scroll metrics show **`clientHeight === scrollHeight`** for the wrong element, or the viewport visually **covers** the footer.

**Fix:**

- Keep **footer / primary actions** as a **sibling below** `ScrollArea`, **`shrink-0`**, **not** inside the scrollport.
- If **`height: 100%`** on the viewport still does not bind in deep flex trees, pin with **`viewportStyle`**: **`position: "absolute"`, `inset: 0`, `minHeight: 0`, `minWidth: 0`** (Enhanced `ScrollArea` root is **`position: relative`**). See scroll-area doc **§6**.

### Content overflows past Card radius or “ignores” the box

**Cause:** **Card** intentionally stays **`overflow-visible`** so dropdowns and focus rings are not clipped. Putting **`overflow-hidden`** only on **Card** is a poor default; the **scroll clip** belongs on an **inner** column.

**Fix:**

- Use a **nested** column: **`flex flex-col min-h-0 overflow-hidden`** on **`CardContent`** or a wrapper, then **`ScrollArea`** (or **`overflow-auto`**) inside. Clip where the scrollport should live.

### Double scrollbar (page + panel both scroll)

**Cause:** Two nested regions both create overflow (e.g. main `overflow-y-auto` and inner `ScrollArea`).

**Fix:**

- Pick **one** primary scroller for the axis (usually the **panel** body). Outer shell: **`min-h-0 flex-1 overflow-hidden`**; inner owns scroll. Avoid **nested `ScrollArea`** for small blocks — use **`overflow-auto`** on a plain div (e.g. code, preview).

### Wide content: clipped horizontally when you need sideways scroll

**Cause:** Enhanced **`ScrollArea`** default **`orientation="vertical"`** applies **`overflow-x-hidden`** on the viewport — good for **chat/prose**, wrong for **`min-w-*`** grids or **`<table>`**.

**Fix:** **`orientation="both"`** for dashboards / tables. For long **text**, prefer **wrapping** (`min-w-0`, `break-words`) per scroll-area **§2**, not widening the whole panel.

### `h-full`, `h-[50dvh]`, or `%` height “does nothing”

**Cause:** The **parent** has **indefinite** height (flex/grid without a bounded chain), so percentage resolution fails.

**Fix:**

- Establish height: **`h-full min-h-0`** on the chain, or a real ceiling **`max-h-[min(...dvh,...)]`**, or **`flex-1`** with ancestors **`min-h-0`**. **`100%`** needs a **definite** containing block.

---

## Generic column shell (Card, Sheet body, sidebar)

Use one **column flex** with a **capped** outer height when the panel must not grow the whole page:

- **Shell:** **`flex flex-col min-h-0 overflow-hidden`** + optional **`max-h-[...]`** / **`h-full`** so the shell has a budget.
- **Header / tabs:** **`shrink-0`**.
- **Scroll body:** **`ScrollArea`** with **`className="min-h-0 flex-1 …"`** (add **`h-0 …`** if flex still expands).
- **Footer:** **`shrink-0`**, sibling of `ScrollArea`, still inside the shell.

Same idea inside **`SheetContent`** or a **resizable** pane: the **scroll owner** sits in the **`flex-1 min-h-0 overflow-hidden`** slot, not wrapped around the whole sheet including the title bar unless intentional.

---

## Checklist (merge into PR review)

- [ ] From viewport → scroll node, flex shrink path includes **`min-h-0`** where needed.
- [ ] Scroll slot has a **finite** height (**`max-h-*`**, **`h-0 flex-1`**, or explicit **`h-[…]`**).
- [ ] **Footer / actions** stay **`shrink-0`** **outside** the scrollport when they must not move.
- [ ] **Clip** on an **inner** wrapper, not only on **Card** root (overlays).
- [ ] **One** primary vertical scroll; no accidental **nested** full-height `ScrollArea`.
- [ ] **Wide grids / tables:** **`orientation="both"`**; **`viewportStyle`** pin if `%` height failed.
- [ ] **`pre` / code:** **`max-height` + `overflow-auto`**, not a second `ScrollArea` (scroll-area **§3**).
