import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

function textFromChildren(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(textFromChildren).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    return textFromChildren(
      (children as { props?: { children?: ReactNode } }).props?.children ?? ""
    );
  }
  return "";
}

function headingId(children: ReactNode) {
  return textFromChildren(children)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const components: Components = {
  h2: ({ children }) => {
    const id = headingId(children);
    return (
      <h2 id={id}>
        {children}
        <a className="heading-anchor" href={`#${id}`} aria-label="Link to this section">
          #
        </a>
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = headingId(children);
    return (
      <h3 id={id}>
        {children}
        <a className="heading-anchor" href={`#${id}`} aria-label="Link to this section">
          #
        </a>
      </h3>
    );
  },
  a: ({ href = "", children }) => {
    const external = /^https:\/\//.test(href);
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },
};

export function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
