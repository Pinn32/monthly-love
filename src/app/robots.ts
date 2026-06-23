import type { MetadataRoute } from "next";

/**
 * Disallow all crawlers from indexing any page.
 * This is a site-level defence-in-depth layer on top of the per-page
 * X-Robots-Tag response headers and <meta robots> tags.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
