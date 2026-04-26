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

// Keywords naar zoektermen mappen
const KEYWORD_MAP: Record<string, string[]> = {
  // Gezondheidsproblemen
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
  // Categorieën
  'voeding': ['voeding', 'brokken', 'natvoer', 'snacks'],
  'speelgoed': ['speelgoed', 'spelen', 'interactief', 'bal'],
  'bench': ['bench', 'mand', 'slaapplaats', 'kussen'],
  'tuigje': ['tuigje', 'halsband', 'riem', 'anti-trek'],
  'kapsalon': ['trimmen', 'knippen', 'grooming', 'salon'],
  '2dehands': ['2dehands', 'tweedehands', 'gebruikt', 'verkopen'],
}

function extractKeywords(message: string): string[] {
  const lower = message.toLowerCase()
  const keywords: string[] = []

  // Zoek op directe hashtags (#jeuk, #puppy, etc.)
  const hashtags = message.match(/#(\w+)/g)
  if (hashtags) {
    hashtags.forEach(tag => {
      const key = tag.slice(1).toLowerCase()
      if (KEYWORD_MAP[key]) keywords.push(...KEYWORD_MAP[key])
      else keywords.push(key)
    })
  }

  // Zoek op keywords in de tekst
  Object.entries(KEYWORD_MAP).forEach(([key, terms]) => {
    if (lower.includes(key)) keywords.push(...terms)
  })

 return [...new Set(keywords)]
}

async function searchDatabase(keywords: string[]) {
  if (keywords.length === 0) return { producten: [], kapsalons: [], listings: [] }

  const supabase = getSupabase()
  const searchTerm = keywords.join(' | ')

  const [producten, kapsalons, listings] = await Promise.all([
    // Zoek producten
    supabase
      .from('producten')
      .select('id, naam, beschrijving, prijs, emoji, badge, categorie')
      .eq('actief', true)
      .or(keywords.map(k => `naam.ilike.%${k}%,beschrijving.ilike.%${k}%,categorie.ilike.%${k}%`).join(','))
      .limit(4),

    // Zoek kapsalons
    supabase
      .from('kapsalons')
      .select('id, naam, locatie, stad, prijs_vanaf, rating, tags')
      .eq('actief', true)
      .eq('geverifieerd', true)
      .limit(3),

    // Zoek 2de hands listings
    supabase
      .from('listings')
      .select('id, titel, vraagprijs, locatie, staat, categorie')
      .eq('status', 'actief')
      .or(keywords.map(k => `titel.ilike.%${k}%,beschrijving.ilike.%${k}%,categorie.ilike.%${k}%`).join(','))
      .limit(3),
  ])

  return {
    producten: producten.data || [],
    kapsalons: kapsalons.data || [],
    listings: listings.data || [],
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    // Keywords extraheren uit het bericht
    const keywords = extractKeywords(message)

    // Database doorzoeken als er keywords zijn
    const dbResults = keywords.length > 0 ? await searchDatabase(keywords) : null

    // Context opbouwen voor Claude
    let dataContext = ''
    if (dbResults) {
      if (dbResults.producten.length > 0) {
        dataContext += '\n\nGEVONDEN PRODUCTEN:\n' + dbResults.producten.map(p =>
          `- ${p.emoji} ${p.naam} — €${p.prijs} (${p.categorie})`
        ).join('\n')
      }
      if (dbResults.kapsalons.length > 0) {
        dataContext += '\n\nGEVONDEN KAPSALONS:\n' + dbResults.kapsalons.map(k =>
          `- ${k.naam} — ${k.stad || k.locatie} (vanaf €${k.prijs_vanaf})`
        ).join('\n')
      }
      if (dbResults.listings.length > 0) {
        dataContext += '\n\nGEVONDEN 2DE HANDS:\n' + dbResults.listings.map(l =>
          `- ${l.titel} — €${l.vraagprijs} (${l.locatie})`
        ).join('\n')
      }
    }

    const systemPrompt = `Je bent Kwispel, de slimme en vrolijke AI-assistent van Kwispelclub — het Belgische platform voor huisdiereigenaren.

Je persoonlijkheid:
- Enthousiast, warm en speels 🐾
- Gebruik af en toe emoji's maar niet overdreven
- Antwoord altijd in het Nederlands
- Houd antwoorden beknopt (max 3-4 zinnen), tenzij uitgebreide info nodig is
- Als je producten, kapsalons of listings vindt, presenteer ze overzichtelijk

Platform info:
- SHOP: biologische voeding, speelgoed, verzorging (/checkout voor winkelwagen)
- KAPSALONS: trimsalons boeken (/kapsalons)
- 2DE HANDS: gebruikte producten kopen/verkopen (/2dehands)  
- ACADEMY: gratis cursussen (/puppy-training)
- ACCOUNT: beheer huisdieren, afspraken, bestellingen (/account)

Slimme zoekfunctie:
- Als gebruiker een probleem noemt (jeuk, vlooien, overgewicht...) zoek je relevante producten
- Als iemand #hashtag gebruikt, zoek je daar specifiek op
- Verwijs altijd naar de juiste pagina met een link

${dataContext ? `\nACTUELE DATA UIT DE DATABASE:${dataContext}\n\nGebruik deze data in je antwoord als het relevant is.` : ''}

Kwispelclub is momenteel in beta — webshop en boekingen komen binnenkort.`

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
      data: dbResults,
      keywords,
    })

  } catch (err: any) {
    console.error('Kwispel search error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
