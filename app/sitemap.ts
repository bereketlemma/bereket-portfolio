import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bereketlemma.com"

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/experience`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/terminal`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/blog/introduction`, lastModified: new Date(), priority: 0.6 },
    { url: `${baseUrl}/blog/llm-inference-bench`, lastModified: new Date(), priority: 0.6 },
    { url: `${baseUrl}/blog/openai-parameter-golf`, lastModified: new Date(), priority: 0.6 },
  ]
}
