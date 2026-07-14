import type { ReactNode } from "react";

type EditorialHeaderProps = {
  title?: string;
  deck?: string;
  variant: "home" | "project" | "thought" | "about";
  align?: "left" | "center";
  meta?: ReactNode[];
  children?: ReactNode;
};

export function EditorialHeader({
  title,
  deck,
  variant,
  align = "center",
  meta = [],
  children,
}: EditorialHeaderProps) {
  const DeckTag = title ? "p" : "h1";

  return (
    <header
      className={`editorial-header editorial-header--${align}${title ? "" : " editorial-header--deck-only"}`}
    >
      {title ? (
        <h1 className={`editorial-headline editorial-headline--${variant}`}>
          {title}
        </h1>
      ) : null}
      {deck ? (
        <DeckTag className={`editorial-deck editorial-deck--${variant}`}>
          {deck}
        </DeckTag>
      ) : null}
      {meta.length > 0 ? (
        <div className="editorial-meta">
          {meta.map((item, index) => (
            <span className="editorial-meta__item" key={index}>
              {index > 0 ? <span aria-hidden="true">•</span> : null}
              {item}
            </span>
          ))}
        </div>
      ) : null}
      {children ? <div className="editorial-actions">{children}</div> : null}
    </header>
  );
}
