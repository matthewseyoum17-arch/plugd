"use server";
import { applyToListing as _applyToListing } from "@/app/actions";

export async function applyToListing(listingId: string, sampleEmail: string) {
  return _applyToListing(listingId, sampleEmail);
}
