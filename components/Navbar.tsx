import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const cookieStore = cookies()
  const headersList = headers()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  let hasSalon = false
  let hasVerkoper = false
  let dashboardUrl = '/account'
  let dashboardLabel = 'Mijn Account'

  if (user) {
    const role = user.user_metadata?.role
    if (role === 'admin') {
      dashboardUrl = '/admin'
      dashboardLabel = '⚙️ Admin'
    } else {
      const [{ data: salon }, { data: verkoper }] = await Promise.all([
        supabase.from('kapsalons').select('id').eq('owner_id', user.id).maybeSingle(),
        supabase.from('verkopers').select('id').eq('profile_id', user.id).maybeSingle(),
      ])
      if (salon) { hasSalon = true; dashboardUrl = '/kapsalons/dashboard'; dashboardLabel = '✂️ Salon Dashboard' }
      if (verkoper) { hasVerkoper = true; dashboardUrl = '/verkoper/dashboard'; dashboardLabel = '🏪 Verkoper Dashboard' }
      if (salon && verkoper) dashboardLabel = 'Dashboards ▾'
    }
  }

  return (
    <NavbarClient
      initialUser={user ? {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      } : null}
      initialHasSalon={hasSalon}
      initialHasVerkoper={hasVerkoper}
      initialDashboardUrl={dashboardUrl}
      initialDashboardLabel={dashboardLabel}
    />
  )
}
