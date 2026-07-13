import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>Page not found.</h1>
      <p>The address may have changed, or the page may never have been published.</p>
      <Link className="arrow-link" href="/">
        Return home <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
