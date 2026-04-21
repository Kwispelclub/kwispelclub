import { createClient } from '@/lib/supabase'

const BUCKET = 'kwispelclub'
const MAX_WIDTH = 1200   // max breedte voor grote afbeeldingen
const MAX_THUMB = 400    // max breedte voor avatars/thumbnails
const QUALITY = 0.82     // JPEG kwaliteit (0-1)

// ── Compress afbeelding client-side ──────────────────────────
export async function compressImage(
  file: File,
  maxWidth = MAX_WIDTH,
  quality = QUALITY
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)

      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Compressie mislukt')),
        'image/jpeg',
        quality
      )
    }
    img.onerror = reject
    img.src = url
  })
}

// ── Upload naar Supabase Storage ──────────────────────────────
export async function uploadImage(
  file: File,
  folder: 'avatars' | 'salons' | 'products' | 'listings',
  userId: string,
  isThumb = false
): Promise<string> {
  const supabase = createClient()

  // Comprimeer eerst
  const maxW = isThumb ? MAX_THUMB : MAX_WIDTH
  const compressed = await compressImage(file, maxW)

  // Unieke bestandsnaam
  const ext = 'jpg'
  const filename = `${userId}-${Date.now()}.${ext}`
  const path = `${folder}/${filename}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) throw error

  // Publieke URL teruggeven
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// ── Verwijder afbeelding ──────────────────────────────────────
export async function deleteImage(url: string): Promise<void> {
  const supabase = createClient()
  // Haal path op uit URL
  const parts = url.split(`/${BUCKET}/`)
  if (parts.length < 2) return
  const path = parts[1]
  await supabase.storage.from(BUCKET).remove([path])
}

// ── Formatteer bestandsgrootte ────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
