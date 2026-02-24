"use server";
import { updateApplicationStatus } from "@/app/actions";

// Wrapper functions to match existing call sites that use separate approve/reject
export async function approveApplication(applicationId: string) {
  return updateApplicationStatus(applicationId, "approved");
}

export async function rejectApplication(applicationId: string) {
  return updateApplicationStatus(applicationId, "rejected");
}
