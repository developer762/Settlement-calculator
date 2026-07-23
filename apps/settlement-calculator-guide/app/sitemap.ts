import type { MetadataRoute } from "next";
import { states } from "@/lib/states";
import { cityGuides } from "@/lib/cities";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...states.map((state) => ({
      url: `${siteUrl}/states/${state.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...cityGuides.map((city) => ({
      url: `${siteUrl}/states/${city.stateSlug}/${city.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
