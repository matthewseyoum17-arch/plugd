"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export function OrderButton({
  gigId,
  tierName,
  priceCents,
  isLoggedIn,
  isSeller,
}: {
  gigId: string;
  tierName: string;
  priceCents: number;
  isLoggedIn: boolean;
  isSeller: boolean;
}) {
  const router = useRouter();

  if (isSeller) {
    return (
      <div className="w-full py-2.5 text-center text-sm text-[var(--foreground-muted)] bg-[var(--background-secondary)] rounded-lg">
        This is your gig
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/signup"
        className="w-full block py-2.5 text-center text-sm font-semibold bg-[var(--cta)] text-white rounded-lg hover:opacity-90 transition"
      >
        Sign Up to Order
      </Link>
    );
  }

  return (
    <button
      onClick={() => {
        // TODO: implement order flow
        router.push(`/gig/${gigId}/order?tier=${tierName}`);
      }}
      className="w-full py-2.5 text-center text-sm font-semibold bg-[var(--cta)] text-white rounded-lg hover:opacity-90 transition"
    >
      Continue ({`$${(priceCents / 100).toFixed(0)}`})
    </button>
  );
}
