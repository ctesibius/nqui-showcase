import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { cn } from "@nqlib/nqui";

type LinkProps = {
  href?: string;
  to?: string;
  children?: ReactNode;
  className?: string;
  _blank?: boolean;
  target?: string;
  rel?: string;
};

export function MDXLink({ href, to, children, className, _blank, ...props }: LinkProps) {
  const url = href ?? to ?? "";
  const classNames = cn(
    "font-medium text-foreground underline-offset-4 hover:underline",
    className,
  );

  if (url.startsWith("/")) {
    return (
      <RouterLink to={url} className={classNames} {...props}>
        {children}
      </RouterLink>
    );
  }

  const external = _blank || url.startsWith("http");
  return (
    <a
      href={url}
      className={classNames}
      target={external ? "_blank" : props.target}
      rel={external ? "noreferrer" : props.rel}
      {...props}
    >
      {children}
    </a>
  );
}
