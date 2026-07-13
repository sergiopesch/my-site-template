import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__message">
        <span className="brand__mark" aria-hidden="true" />
        <span>Built for people, readable by machines.</span>
      </div>
      <nav className="footer-nav" aria-label="Footer navigation">
        {footerLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
