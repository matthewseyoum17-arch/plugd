import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Read role from public.users table
      const { data: userRow } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      let role: string

      if (!userRow) {
        // Users row missing — create from auth metadata
        const meta = data.user.user_metadata || {}
        role = meta.role || 'setter'
        const fullName = meta.first_name && meta.last_name
          ? `${meta.first_name} ${meta.last_name}`
          : data.user.email?.split('@')[0] || 'User'

        await supabase.from('users').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role,
        }, { onConflict: 'id' })

        if (role === 'founder') {
          await supabase.from('founder_profiles').upsert({
            founder_id: data.user.id,
            company_name: meta.company_name || null,
          }, { onConflict: 'founder_id' })
        } else {
          await supabase.from('setter_profiles').upsert({
            setter_id: data.user.id,
          }, { onConflict: 'setter_id' })
        }
      } else {
        role = userRow.role
      }

      return NextResponse.redirect(`${origin}/dashboard/${role}`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
