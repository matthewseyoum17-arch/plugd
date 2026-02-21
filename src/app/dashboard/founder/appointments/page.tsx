import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppointmentActions } from './_components/AppointmentActions'

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
    .select('*, listings(id, title, commission_per_appointment, commission_per_close), setter_profiles(setter_id, users!setter_profiles_setter_id_fkey(full_name))')
    .eq('company_id', user.id)
    .order('submitted_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
      case 'confirmed': return 'bg-green-900/30 text-green-400 border border-green-800'
      case 'auto_approved': return 'bg-blue-900/30 text-blue-400 border border-blue-800'
      case 'rejected': return 'bg-red-900/30 text-red-400 border border-red-800'
      case 'disputed': return 'bg-orange-900/30 text-orange-400 border border-orange-800'
      default: return 'bg-gray-800/30 text-gray-400 border border-gray-700'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Appointments</h1>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Setter</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Listing</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {appointments?.map((apt) => (
              <tr key={apt.id} className="hover:bg-[#1f1f1f]">
                <td className="px-6 py-4 text-gray-300">
                  {apt.setter_profiles?.users?.full_name || 'Setter'}
                </td>
                <td className="px-6 py-4 text-white">{apt.listings?.title || 'N/A'}</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white">{apt.contact_name}</div>
                  <div className="text-xs text-gray-500">{apt.contact_email}</div>
                </td>
                <td className="px-6 py-4 text-gray-300 capitalize">{apt.appointment_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(apt.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <AppointmentActions
                    appointmentId={apt.id}
                    currentStatus={apt.status}
                    setterId={apt.setter_id}
                    commissionPerAppointment={apt.listings?.commission_per_appointment || 0}
                    commissionPerClose={apt.listings?.commission_per_close || 0}
                    appointmentType={apt.appointment_type}
                  />
                </td>
              </tr>
            ))}
            {(!appointments || appointments.length === 0) && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
