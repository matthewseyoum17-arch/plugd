"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewGigPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [basicPrice, setBasicPrice] = useState("");
  const [basicDelivery, setBasicDelivery] = useState("7");
  const [basicRevisions, setBasicRevisions] = useState("1");
  const [basicDesc, setBasicDesc] = useState("");
  const [standardPrice, setStandardPrice] = useState("");
  const [standardDelivery, setStandardDelivery] = useState("5");
  const [standardRevisions, setStandardRevisions] = useState("3");
  const [standardDesc, setStandardDesc] = useState("");
  const [premiumPrice, setPremiumPrice] = useState("");
  const [premiumDelivery, setPremiumDelivery] = useState("3");
  const [premiumRevisions, setPremiumRevisions] = useState("-1");
  const [premiumDesc, setPremiumDesc] = useState("");

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("display_order")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title.trim() || !description.trim() || !basicPrice) {
      setError("Title, description, and basic price are required.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const gigData: Record<string, unknown> = {
      seller_id: user.id,
      title: title.trim(),
      slug,
      description: description.trim(),
      category_id: categoryId || null,
      search_tags: tags
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      price_basic_cents: Math.round(parseFloat(basicPrice) * 100),
      price_basic_delivery_days: parseInt(basicDelivery) || 7,
      price_basic_revisions: parseInt(basicRevisions) || 1,
      price_basic_description: basicDesc || null,
      status: "active",
    };

    if (standardPrice) {
      gigData.price_standard_cents = Math.round(parseFloat(standardPrice) * 100);
      gigData.price_standard_delivery_days = parseInt(standardDelivery) || 5;
      gigData.price_standard_revisions = parseInt(standardRevisions) || 3;
      gigData.price_standard_description = standardDesc || null;
    }

    if (premiumPrice) {
      gigData.price_premium_cents = Math.round(parseFloat(premiumPrice) * 100);
      gigData.price_premium_delivery_days = parseInt(premiumDelivery) || 3;
      gigData.price_premium_revisions = parseInt(premiumRevisions) === -1 ? -1 : parseInt(premiumRevisions) || 5;
      gigData.price_premium_description = premiumDesc || null;
    }

    const { error: insertError } = await supabase.from("gigs").insert(gigData);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/seller/gigs");
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-hint)] focus:outline-none focus:ring-2 focus:ring-[var(--cta)]";
  const labelClass = "block text-sm font-medium text-[var(--foreground)] mb-1";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        Create a New Gig
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className={labelClass}>
            Gig Title <span className="text-[var(--destructive)]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="I will design a professional website for your business"
            className={inputClass}
            required
          />
          <p className="text-xs text-[var(--foreground-hint)] mt-1">
            Start with &quot;I will&quot; for best results
          </p>
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>
            Description <span className="text-[var(--destructive)]">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your service in detail..."
            rows={6}
            className={inputClass}
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className={labelClass}>Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="web design, responsive, wordpress (comma-separated)"
            className={inputClass}
          />
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Pricing Packages
          </h2>

          {/* Basic */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-medium text-[var(--foreground)] mb-3">
              Basic <span className="text-[var(--destructive)]">*</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--foreground-muted)]">Price ($)</label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  value={basicPrice}
                  onChange={(e) => setBasicPrice(e.target.value)}
                  placeholder="25"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[var(--foreground-muted)]">Delivery (days)</label>
                <input
                  type="number"
                  min="1"
                  value={basicDelivery}
                  onChange={(e) => setBasicDelivery(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--foreground-muted)]">Revisions</label>
                <input
                  type="number"
                  min="0"
                  value={basicRevisions}
                  onChange={(e) => setBasicRevisions(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-[var(--foreground-muted)]">Description</label>
              <input
                type="text"
                value={basicDesc}
                onChange={(e) => setBasicDesc(e.target.value)}
                placeholder="What's included in the basic package"
                className={inputClass}
              />
            </div>
          </div>

          {/* Standard (optional) */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-medium text-[var(--foreground)] mb-3">
              Standard <span className="text-xs text-[var(--foreground-muted)]">(optional)</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--foreground-muted)]">Price ($)</label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  value={standardPrice}
                  onChange={(e) => setStandardPrice(e.target.value)}
                  placeholder="50"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--foreground-muted)]">Delivery (days)</label>
                <input
                  type="number"
                  min="1"
                  value={standardDelivery}
                  onChange={(e) => setStandardDelivery(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--foreground-muted)]">Revisions</label>
                <input
                  type="number"
                  min="0"
                  value={standardRevisions}
                  onChange={(e) => setStandardRevisions(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-[var(--foreground-muted)]">Description</label>
              <input
                type="text"
                value={standardDesc}
                onChange={(e) => setStandardDesc(e.target.value)}
                placeholder="What's included in the standard package"
                className={inputClass}
              />
            </div>
          </div>

          {/* Premium (optional) */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="font-medium text-[var(--foreground)] mb-3">
              Premium <span className="text-xs text-[var(--foreground-muted)]">(optional)</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--foreground-muted)]">Price ($)</label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(e.target.value)}
                  placeholder="100"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--foreground-muted)]">Delivery (days)</label>
                <input
                  type="number"
                  min="1"
                  value={premiumDelivery}
                  onChange={(e) => setPremiumDelivery(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--foreground-muted)]">
                  Revisions <span className="text-[10px]">(-1 = unlimited)</span>
                </label>
                <input
                  type="number"
                  min="-1"
                  value={premiumRevisions}
                  onChange={(e) => setPremiumRevisions(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-[var(--foreground-muted)]">Description</label>
              <input
                type="text"
                value={premiumDesc}
                onChange={(e) => setPremiumDesc(e.target.value)}
                placeholder="What's included in the premium package"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-[var(--destructive)]">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[var(--cta)] text-white font-medium text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Gig"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-[var(--border)] text-[var(--foreground-muted)] font-medium text-sm rounded-lg hover:bg-[var(--border)] transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
