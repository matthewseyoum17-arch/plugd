import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Appointments() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role

  if (role !== 'founder') {
    redirect('/dashboard/setter')
  }

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, listings(title), setter_profiles(setter_id, users!setter_profiles_setter_id_fkey(full_name))')
    .eq('company_id', user.id)
    .order('submitted_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-900 text-yellow-300'
      case 'confirmed': return 'bg-green-900 text-green-300'
      case 'auto_approved': return 'bg-blue-900 text-blue-300'
      case 'rejected': return 'bg-red-900 text-red-300'
      case 'disputed': return 'bg-orange-900 text-orange-300'
      default: return 'bg-gray-700 text-gray-300'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Appointments</h1>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Setter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Listing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {appointments?.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-750">
                <td className="px-6 py-4">
                  <div className="text-sm">Setter</div>
                </td>
                <td className="px-6 py-4">{apt.listings?.title || 'N/A'}</td>
                <td className="px-6 py-4">
                  <div className="text-sm">{apt.contact_name}</div>
                  <div className="text-xs text-gray-400">{apt.contact_email}</div>
                </td>
                <td className="px-6 py-4 capitalize">{apt.appointment_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(apt.submitted_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {(!appointments || appointments.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No appointments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
