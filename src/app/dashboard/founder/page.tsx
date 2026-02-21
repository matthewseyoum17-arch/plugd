import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FounderDashboard() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900">Founder Dashboard</h1>
      <p className="mt-4 text-gray-600">Welcome to your founder dashboard!</p>
    </div>
  )
}
