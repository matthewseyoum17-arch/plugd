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
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      let role: string

      if (userError || !userRow) {
        // Users row missing — create from auth metadata
        console.error('Users row missing in auth callback, creating:', userError)
        const meta = data.user.user_metadata || {}
        role = meta.role || 'setter'
        const fullName = meta.first_name && meta.last_name
          ? `${meta.first_name} ${meta.last_name}`
          : data.user.email?.split('@')[0] || 'User'

        const { error: insertErr } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role,
        })
        if (insertErr) {
          console.error('Error creating users row in auth callback:', insertErr)
        }

        if (role === 'setter') {
          const { error: profileErr } = await supabase.from('setter_profiles').insert({
            setter_id: data.user.id,
          })
          if (profileErr) {
            console.error('Error creating setter_profiles in auth callback:', profileErr)
          }
        }
      } else {
        role = userRow.role
      }

      return NextResponse.redirect(`${origin}/dashboard/${role}`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
