"use server";
import { confirmAppointment as _confirmAppointment, disputeAppointment as _disputeAppointment } from "@/app/actions";

export async function confirmAppointment(appointmentId: string) {
  return _confirmAppointment(appointmentId);
}

export async function disputeAppointment(appointmentId: string) {
  return _disputeAppointment(appointmentId);
}
