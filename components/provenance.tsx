type ProvenanceItem = {
  label: string;
  value: string;
  href?: string | null;
};

export function Provenance({ items }: { items: ProvenanceItem[] }) {
  return (
    <dl className="provenance" aria-label="Content provenance">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            {item.href ? (
              <a
                href={item.href}
                target={item.href.startsWith("https://") ? "_blank" : undefined}
                rel={item.href.startsWith("https://") ? "noopener noreferrer" : undefined}
              >
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
