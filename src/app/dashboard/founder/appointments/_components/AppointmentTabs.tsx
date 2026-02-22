'use client'

import { Tabs } from '@/components/ui/Tabs'
import { AppointmentCard } from './AppointmentCard'

type Appointment = {
  id: string
  status: string
  setter_id: string
  contact_name: string
  contact_email: string
  appointment_type: string
  submitted_at: string
  listings: { id: string; title: string; commission_per_appointment: number; commission_per_close: number } | null
  setter_profiles: { setter_id: string; users: { full_name: string } | null } | null
}

export function AppointmentTabs({ appointments }: { appointments: Appointment[] }) {
  const pending = appointments.filter(a => a.status === 'submitted')
  const confirmed = appointments.filter(a => a.status === 'confirmed' || a.status === 'auto_approved')
  const disputed = appointments.filter(a => a.status === 'disputed')

  const renderList = (list: Appointment[]) => {
    if (list.length === 0) {
      return (
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-12 text-center">
          <p className="text-gray-500">No appointments in this category.</p>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map(apt => (
          <AppointmentCard
            key={apt.id}
            id={apt.id}
            status={apt.status}
            setterName={apt.setter_profiles?.users?.full_name || 'Setter'}
            listingTitle={apt.listings?.title || 'N/A'}
            contactName={apt.contact_name}
            contactEmail={apt.contact_email}
            appointmentType={apt.appointment_type}
            submittedAt={apt.submitted_at}
            setterId={apt.setter_id}
            commissionPerAppointment={apt.listings?.commission_per_appointment || 0}
            commissionPerClose={apt.listings?.commission_per_close || 0}
          />
        ))}
      </div>
    )
  }

  return (
    <Tabs tabs={['Pending', 'Confirmed', 'Disputed']}>
      {(tab) => {
        if (tab === 'Pending') return renderList(pending)
        if (tab === 'Confirmed') return renderList(confirmed)
        return renderList(disputed)
      }}
    </Tabs>
  )
}
