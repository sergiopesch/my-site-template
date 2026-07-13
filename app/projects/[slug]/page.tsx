import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EntryPage } from "@/components/entry-page";
import { getEntry, getProjects } from "@/lib/catalog";
import { buildEntryMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getProjects().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry("project", slug);
  if (!entry) return {};
  return {
    ...buildEntryMetadata(entry),
    twitter: { card: "summary", title: entry.title, description: entry.summary },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("project", slug);
  if (!entry) notFound();
  return <EntryPage entry={entry} />;
}
