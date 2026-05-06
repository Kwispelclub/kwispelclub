import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const KEYWORD_MAP: Record<string, string[]> = {
  'jeuk': ['jeuk', 'allergie', 'huidverzorging', 'shampoo', 'omega'],
  'vlooien': ['vlooien', 'teken', 'antiparasitair', 'bescherming'],
  'gewrichten': ['gewrichten', 'heupen', 'mobiliteit', 'omega', 'senior', 'glucosamine'],
  'tanden': ['tanden', 'gebit', 'mondverzorging', 'kauwbot'],
  'overgewicht': ['dieet', 'light', 'gewicht', 'caloriearm'],
  'angst': ['angst', 'stress', 'kalmering', 'thunder'],
  'puppy': ['puppy', 'junior', 'jong', 'groei'],
  'senior': ['senior', 'oud', 'gewrichten', 'mobiliteit'],
  'haar': ['haar', 'vacht', 'borstel', 'trimmen', 'verzorging'],
  'training': ['training', 'gehoorzaamheid', 'commando', 'beloning', 'snack'],
  'voeding': ['voeding', 'brokken', 'natvoer', 'snacks'],
  'speelgoed': ['speelgoed', 'spelen', 'interactief', 'bal'],
  'bench': ['bench', 'mand', 'slaapplaats', 'kussen'],
  'tuigje': ['tuigje', 'halsband', 'riem', 'anti-trek'],
  'kapsalon': ['trimmen', 'knippen', 'grooming', 'salon'],
  '2dehands': ['2dehands', 'tweedehands', 'gebruikt', 'verkopen'],
  'cursus': ['cursus', 'training', 'leren', 'academy'],
}

function extractKeywords(message: string): string[] {
  const lower = message.toLowerCase()
  const keywords: string[] = []
  const hashtags = message.match(/#(\w+)/g)
  if (hashtags) {
    hashtags.forEach(tag => {
      const key = tag.slice(1).toLowerCase()
      if (KEYWORD_MAP[key]) keywords.push(...KEYWORD_MAP[key])
      else keywords.push(key)
    })
  }
  Object.entries(KEYWORD_MAP).forEach(([key, terms]) => {
    if (lower.includes(key)) keywords.push(...terms)
  })
  const unique: string[] = []
  keywords.forEach(k => { if (!unique.includes(k)) unique.push(k) })
  return unique
}

async function searchDatabase(keywords: string[], pagina?: string) {
  if (keywords.length === 0) return { producten: [], kapsalons: [], listings: [], cursussen: [] }
  const supabase = getSupabase()

  const [producten, kapsalons, listings, cursussen] = await Promise.all([
    // ✅ was 'producten' → nu 'products' met juiste veldnamen
    supabase
      .from('products')
      .select('id, name, description, price, image_url, status')
      .eq('status', 'actief')
      .or(keywords.map(k => `name.ilike.%${k}%,description.ilike.%${k}%`).join(','))
      .limit(4),

    // ✅ was 'kapsalons' → nu 'salons' 
    supabase
      .from('salons')
      .select('id, name, location, phone, rating, tags')
      .eq('status', 'actief')
      .limit(3),

    // listings blijft hetzelfde
    supabase
      .from('listings')
      .select('id, titel, vraagprijs, locatie, staat, categorie')
      .eq('status', 'actief')
      .or(keywords.map(k => `titel.ilike.%${k}%,beschrijving.ilike.%${k}%,categorie.ilike.%${k}%`).join(','))
      .limit(3),

    // ✅ was 'cursussen' → nu 'courses'
    supabase
      .from('courses')
      .select('id, title, description, duration_text, total_modules, total_lessons')
      .eq('status', 'actief')
      .limit(3),
  ])

  return {
    producten: producten.data || [],
    kapsalons: kapsalons.data || [],
    listings: listings.data || [],
    cursussen: cursussen.data || [],
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, pagina } = await request.json()
    const keywords = extractKeywords(message)
    const dbResults = keywords.length > 0 ? await searchDatabase(keywords, pagina) : null

    // Pagina-specifieke context
    const paginaContext: Record<string, string> = {
      '/': 'De gebruiker is op de homepage.',
      '/winkel': 'De gebruiker bekijkt de webshop. Focus op producten.',
      '/2dehands': 'De gebruiker is op de 2de Hands marktplaats. Focus op tweedehands items.',
      '/puppy-training': 'De gebruiker bekijkt de Academy. Focus op cursussen en training.',
      '/kapsalons': 'De gebruiker zoekt een kapsalon. Focus op trimsalons en afspraken.',
      '/blog': 'De gebruiker leest het blog. Focus op tips en advies.',
    }

    let dataContext = ''
    if (dbResults) {
      if (dbResults.producten.length > 0) {
        dataContext += '\n\nGEVONDEN PRODUCTEN:\n' + dbResults.producten.map((p: any) =>
          `- ${p.name} — €${p.price}`
        ).join('\n')
      }
      if (dbResults.kapsalons.length > 0) {
        dataContext += '\n\nGEVONDEN KAPSALONS:\n' + dbResults.kapsalons.map((k: any) =>
          `- ${k.name} — ${k.location}`
        ).join('\n')
      }
      if (dbResults.listings.length > 0) {
        dataContext += '\n\nGEVONDEN 2DE HANDS:\n' + dbResults.listings.map((l: any) =>
          `- ${l.titel} — €${l.vraagprijs} (${l.locatie})`
        ).join('\n')
      }
      if (dbResults.cursussen.length > 0) {
        dataContext += '\n\nGEVONDEN CURSUSSEN:\n' + dbResults.cursussen.map((c: any) =>
          `- ${c.title} — ${c.total_modules} modules, ${c.total_lessons} lessen`
        ).join('\n')
      }
    }

    const systemPrompt = `Je bent Kwispel, de slimme en vrolijke AI-assistent van Kwispelclub — het Belgische platform voor huisdiereigenaren.

Je persoonlijkheid:
- Enthousiast, warm en speels 🐾
- Gebruik af en toe emoji's maar niet overdreven
- Antwoord altijd in het Nederlands
- Houd antwoorden beknopt (max 3-4 zinnen), tenzij uitgebreide info nodig is

${pagina ? `Huidige pagina: ${paginaContext[pagina] || ''}` : ''}

Platform info:
- SHOP: producten kopen (/winkel/[shop-slug])
- KAPSALONS: trimsalons boeken (/kapsalons)
- 2DE HANDS: gebruikte producten kopen/verkopen (/2dehands)
- ACADEMY: cursussen volgen (/puppy-training)
- ACCOUNT: beheer huisdieren, afspraken, bestellingen (/account)
- BERICHTEN: chat met verkopers via /account?panel=berichten

Slimme zoekfunctie:
- Als gebruiker een probleem noemt (jeuk, vlooien, overgewicht...) zoek je relevante producten
- Als iemand #hashtag gebruikt, zoek je daar specifiek op
- Verwijs altijd naar de juiste pagina

${dataContext ? `\nACTUELE DATA UIT DE DATABASE:${dataContext}\n\nGebruik deze data in je antwoord als het relevant is.` : ''}

Kwispelclub is momenteel in beta — sommige features komen binnenkort.`

    const messages = [
      ...(history || []),
      { role: 'user' as const, content: message }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: systemPrompt,
      messages,
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({
      reply,
      data: dbResults ? {
        // ✅ Map naar verwachte veldnamen voor de UI
        producten: dbResults.producten.map((p: any) => ({
          id: p.id,
          naam: p.name,
          prijs: p.price,
          emoji: '🐾',
          categorie: p.description?.slice(0, 30) || '',
        })),
        kapsalons: dbResults.kapsalons.map((k: any) => ({
          id: k.id,
          naam: k.name,
          stad: k.location,
          prijs_vanaf: null,
        })),
        listings: dbResults.listings,
        cursussen: dbResults.cursussen,
      } : null,
      keywords,
    })

  } catch (err: any) {
    console.error('Kwispel search error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
