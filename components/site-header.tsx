"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Thoughts" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  function toggleTheme() {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.add("theme-transitioning");
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 220);
  }

  const themeButton = (className: string) => (
    <button
      className={className}
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
      title="Toggle Dark Mode"
    >
      <Moon className="theme-icon theme-icon--moon" aria-hidden="true" />
      <Sun className="theme-icon theme-icon--sun" aria-hidden="true" />
    </button>
  );

  return (
    <header className="site-header">
      <div className="site-shell site-header__inner">
        <div className="site-header__brand-row">
          <Link className="brand" href="/" aria-label="Homepage">
            <span className="brand__full">{name}</span>
            <span className="brand__short">{initials || "YN"}</span>
          </Link>
          {themeButton("theme-toggle theme-toggle--mobile")}
        </div>
        <div className="site-header__nav-row">
          <nav className="primary-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(pathname, item.href)}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {themeButton("theme-toggle theme-toggle--desktop")}
        </div>
      </div>
    </header>
  );
}
