import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'

  // Protect /dashboard/* — redirect to /login if no session
  if (isDashboardRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Role-based cross-dashboard redirect
  if (isDashboardRoute && user) {
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userRow?.role || user.user_metadata?.role || 'setter'
    const isFounderRoute = request.nextUrl.pathname.startsWith('/dashboard/founder')
    const isSetterRoute = request.nextUrl.pathname.startsWith('/dashboard/setter')

    if (role === 'founder' && isSetterRoute) {
      return NextResponse.redirect(new URL('/dashboard/founder', request.url))
    }
    if (role === 'setter' && isFounderRoute) {
      return NextResponse.redirect(new URL('/dashboard/setter', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userRow?.role || user.user_metadata?.role || 'setter'
    const redirectUrl = new URL(`/dashboard/${role}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
