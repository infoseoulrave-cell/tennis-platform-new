import type { MetadataRoute } from "next";

// A partial list of public routes. Product details and query variants are omitted.
const publicPaths = [
  "/",
  "/rackets",
  "/strings",
  "/gear",
  "/guide",
  "/guide/dna",
  "/guide/strings",
  "/guide/grip",
  "/guide/terms",
  "/guide/tennis-apparel",
  "/knowledge",
  "/players",
  "/updates",
  "/about",
  "/shops",
  "/partners",
  "/advertise",
  "/business",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({ url: `https://racketlab.kr${path}` }));
}
