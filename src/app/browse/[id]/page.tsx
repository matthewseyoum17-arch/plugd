import { redirect } from "next/navigation";

// Redirect old browse/[id] URLs to the new /gig/[id] route
export default function BrowseDetailRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/gig/${params.id}`);
}
