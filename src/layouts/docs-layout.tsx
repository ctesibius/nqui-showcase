import { Outlet } from "react-router-dom";

export function DocsLayout() {
  return (
    <div className="min-h-[calc(100dvh-4.5rem)]">
      <Outlet />
    </div>
  );
}
