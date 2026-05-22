// Helper om notificatie aan te maken — kopieer naar app/lib/notifications.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string
  type: string
  title: string
  message?: string
  link?: string
}) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message: message || null,
    link: link || null,
  })
}
