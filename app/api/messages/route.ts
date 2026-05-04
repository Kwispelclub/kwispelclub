import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: haal berichten op voor een conversatie of inbox
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const conversation_id = searchParams.get('conversation_id')
  const user_id = searchParams.get('user_id')

  const supabase = getSupabase()

  if (conversation_id) {
    // Haal alle berichten van een conversatie op
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(first_name, last_name, avatar_url)')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Markeer als gelezen
    if (user_id) {
      await supabase
        .from('messages')
        .update({ gelezen: true })
        .eq('conversation_id', conversation_id)
        .eq('receiver_id', user_id)
        .eq('gelezen', false)
    }

    return NextResponse.json({ messages: data || [] })
  }

  if (user_id) {
    // Haal inbox op — laatste bericht per conversatie
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(first_name, last_name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(first_name, last_name, avatar_url),
        product:products(name, image_url)
      `)
      .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Groepeer per conversatie — alleen laatste bericht
    const seen = new Set()
    const inbox = (data || []).filter(m => {
      if (seen.has(m.conversation_id)) return false
      seen.add(m.conversation_id)
      return true
    })

    return NextResponse.json({ inbox })
  }

  return NextResponse.json({ error: 'user_id of conversation_id vereist' }, { status: 400 })
}

// POST: stuur een bericht
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sender_id, receiver_id, product_id, verkoper_id, message, conversation_id } = body

    if (!sender_id || !receiver_id || !message) {
      return NextResponse.json({ error: 'sender_id, receiver_id en message zijn verplicht' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Gebruik bestaande conversation_id of maak nieuwe aan
    const convId = conversation_id || uuidv4()

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id,
        receiver_id,
        product_id: product_id || null,
        verkoper_id: verkoper_id || null,
        body: message,
        gelezen: false,
      })
      .select()
      .single()

    if (error) throw error

    // Stuur email notificatie naar ontvanger
    const { data: receiver } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('id', receiver_id)
      .single()

    const { data: sender } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', sender_id)
      .single()

    if (receiver?.email && sender) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kwispelclub.be'
      await fetch(`${siteUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nieuw_bericht',
          to: receiver.email,
          data: {
            receiverName: receiver.first_name,
            senderName: `${sender.first_name} ${sender.last_name}`,
            message,
            conversationId: convId,
          }
        })
      }).catch(() => {})
    }

    return NextResponse.json({ message: data, conversation_id: convId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
