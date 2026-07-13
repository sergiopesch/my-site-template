import Link from "next/link";

type ContentRowProps = {
  href: string;
  label?: string;
  title: string;
  summary: string;
  metadata?: string;
  actionLabel: string;
};

export function ContentRow({
  href,
  label,
  title,
  summary,
  metadata,
  actionLabel,
}: ContentRowProps) {
  return (
    <article className="content-row">
      <div className="content-row__title">
        {label ? <p className="section-label">{label}</p> : null}
        <h2>
          <Link href={href}>{title}</Link>
        </h2>
        {metadata ? <p className="content-meta">{metadata}</p> : null}
      </div>
      <p className="content-row__summary">{summary}</p>
      <Link className="arrow-link" href={href}>
        {actionLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
