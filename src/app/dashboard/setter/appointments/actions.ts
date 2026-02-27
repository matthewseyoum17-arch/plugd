"use server";
import { submitAppointment as _submitAppointment } from "@/app/actions";

type SubmitAppointmentInput = {
  listing_id: string;
  contact_name: string;
  contact_email: string;
  contact_company: string;
  calendly_event_url: string;
  appointment_type: "appointment" | "close";
  meeting_date?: string;
  contact_linkedin?: string;
  contact_website?: string;
  notes?: string;
};

export async function submitAppointment(input: SubmitAppointmentInput) {
  return _submitAppointment(input);
}
