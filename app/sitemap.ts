import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kwispelclub.be'
  const now = new Date()

  // Statische pagina's
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/winkel`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/kapsalons`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/2dehands`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/puppy-training`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/dierenarts`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/over-ons`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/word-verkoper`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Dynamische verkoper shop pagina's
  const { data: verkopers } = await supabase
    .from('verkopers')
    .select('slug, updated_at')
    .eq('status', 'actief')
    .not('slug', 'is', null)

  const verkoperPages: MetadataRoute.Sitemap = (verkopers || []).map(v => ({
    url: `${baseUrl}/winkel/${v.slug}`,
    lastModified: new Date(v.updated_at || now),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamische kapsalon pagina's
  const { data: kapsalons } = await supabase
    .from('kapsalons')
    .select('slug, updated_at')
    .eq('status', 'actief')
    .not('slug', 'is', null)

  const kapsalonPages: MetadataRoute.Sitemap = (kapsalons || []).map(k => ({
    url: `${baseUrl}/kapsalons/${k.slug}`,
    lastModified: new Date(k.updated_at || now),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...verkoperPages, ...kapsalonPages]
}
