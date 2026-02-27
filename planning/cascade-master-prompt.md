# Master Windsurf Cascade Prompt — Fiverr-Style Freelance Marketplace

> Copy-paste this entire prompt into Windsurf Cascade to build the full MVP in one session.

---

## PROMPT START

You are building a production-ready Fiverr-style freelance marketplace called **GigFlow**. It is a two-sided marketplace where sellers list service gigs and buyers browse, purchase, and review them. The design follows an Airbnb-inspired card aesthetic with a refined minimalist color palette.

### Tech Stack
- **Next.js 15** App Router (app/ directory, Server Components by default, Server Actions)
- **Tailwind CSS 4** + **shadcn/ui** (use `npx shadcn@latest init` then add components as needed)
- **lucide-react** for all icons
- **Supabase** for Auth (email + magic link), Postgres DB, Realtime, and Storage (gig images, avatars)
- **Inter** font via `next/font/google`
- TypeScript throughout, strict mode

### Project Init
```bash
npx create-next-app@latest gigflow --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd gigflow
npx shadcn@latest init
# Pick: New York style, Slate base color, CSS variables: yes
npx shadcn@latest add button card input textarea select badge avatar dropdown-menu dialog sheet tabs separator skeleton toast tooltip switch label
npm install @supabase/supabase-js @supabase/ssr lucide-react
```

### Color System — Minimalist Palette

Implement a theme that supports both light and dark modes via a `ThemeProvider` (next-themes). Use CSS variables in `globals.css`:

**Light Mode (default):**
- Background: `#FFFFFF` (pure white page), `#F8F9FA` (section backgrounds, card hover)
- Surface/Card: `#FFFFFF` with `border: 1px solid #E5E7EB`, subtle `shadow-sm` on hover
- Text Primary: `#1F2937` (deep charcoal)
- Text Secondary: `#6B7280` (muted gray)
- Text Tertiary: `#9CA3AF` (light gray for hints)
- Accent/Primary: `#1F2937` (charcoal buttons — minimal and premium feel)
- Accent Hover: `#374151`
- CTA Highlight: `#10B981` (emerald green — for success states, "Order Now" buttons)
- CTA Hover: `#059669`
- Borders: `#E5E7EB`
- Dividers: `#F3F4F6`
- Stars/Rating: `#F59E0B` (amber)
- Warm accent: `#78716C` (stone — for seller levels, badges)

**Dark Mode:**
- Background: `#0F0F0F` (near-black)
- Surface/Card: `#1A1A1A` with `border: 1px solid #2A2A2A`
- Text Primary: `#F9FAFB`
- Text Secondary: `#9CA3AF`
- Accent/Primary: `#F9FAFB` (white buttons on dark)
- CTA Highlight: `#10B981` (same emerald)
- Borders: `#2A2A2A`

**Typography:**
- Font: Inter, system sans-serif fallback
- Headings: font-semibold, tracking-tight
- Body: text-sm or text-base, leading-relaxed
- Generous whitespace — `py-16` to `py-24` section padding, `gap-6` card grids

### Supabase Setup

1. Create a Supabase project. Add env vars to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Create `src/lib/supabase/client.ts` (browser client) and `src/lib/supabase/server.ts` (server client using `@supabase/ssr` with cookie helpers for App Router).

3. Create `src/middleware.ts` that refreshes the Supabase auth session on every request.

4. Run the full SQL schema from `planning/supabase-schema.sql` in the Supabase SQL Editor. This creates: profiles, categories, subcategories, gigs, gig_images, gig_faqs, orders, order_deliveries, reviews, favorites, conversations, messages, notifications, seller_payouts — all with RLS policies.

5. Create Storage buckets in Supabase Dashboard:
   - `avatars` (public)
   - `gig-images` (public)
   - `deliveries` (private, participants only)

### Pages & Routes (exact structure)

```
src/app/
├── layout.tsx              # Root layout: Inter font, ThemeProvider, Navbar, Footer
├── page.tsx                # Home: Hero + Category bar + Featured gigs + Trending
├── globals.css             # Tailwind + CSS variables for theming
│
├── (auth)/
│   ├── login/page.tsx      # Email + magic link login (clean minimal form)
│   └── signup/page.tsx     # Signup with username, full name, email, role select
│   └── auth/callback/route.ts  # Supabase auth callback handler
│
├── search/page.tsx         # Search results with filters sidebar
├── categories/
│   └── [slug]/page.tsx     # Category listing page
│
├── gig/
│   └── [id]/page.tsx       # Gig detail: image gallery, package tabs, reviews, seller card
│
├── [username]/page.tsx     # Public seller profile
│
├── dashboard/
│   ├── layout.tsx          # Dashboard sidebar layout (seller/buyer toggle)
│   ├── page.tsx            # Overview: stats cards, recent orders, earnings chart
│   ├── gigs/
│   │   ├── page.tsx        # My gigs list (table with status badges)
│   │   └── new/page.tsx    # Create gig (multi-step form)
│   │   └── [id]/edit/page.tsx  # Edit gig
│   ├── orders/page.tsx     # Orders list (filterable tabs: active, delivered, completed)
│   ├── orders/[id]/page.tsx    # Order detail: timeline, delivery, chat
│   ├── messages/page.tsx   # Inbox with conversation list + chat panel
│   ├── favorites/page.tsx  # Saved gigs grid
│   ├── earnings/page.tsx   # Earnings summary, payout history, withdrawal
│   ├── reviews/page.tsx    # Reviews received (seller) / given (buyer)
│   └── settings/page.tsx   # Profile edit, notification prefs, account
```

### Component Architecture

Build these reusable components in `src/components/`:

**Layout:**
- `Navbar` — Logo, search bar (expandable), category dropdown, dark mode toggle (sun/moon icon using shadcn Switch or custom), notification bell, avatar dropdown with links to dashboard/profile/logout. Sticky top. Clean white/dark bg with bottom border.
- `Footer` — Minimal: links columns (Categories, About, Support, Community), bottom bar with copyright + social icons.
- `MobileNav` — Sheet-based hamburger menu for mobile.

**Gig Cards (Airbnb-inspired):**
- `GigCard` — Rounded-xl card with: image (aspect-video, rounded-t-xl), heart icon overlay (favorite toggle), seller avatar + name row, title (2-line clamp), star rating + review count, starting price bold at bottom-right. Hover: subtle shadow-md lift + border color change. Skeleton loading state.
- Grid layout: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`

**Gig Detail:**
- `ImageGallery` — Main image + thumbnail strip, click to enlarge (Dialog).
- `PackageTabs` — shadcn Tabs showing Basic / Standard / Premium with price, delivery, revisions, feature checklist, "Continue" button.
- `SellerSidebar` — Avatar, name, level badge, response time, "Contact Me" button, stats.
- `ReviewList` — Star breakdown bar chart, individual review cards with avatar + rating + comment.
- `GigFAQ` — Accordion of Q&A pairs.

**Dashboard:**
- `DashboardSidebar` — Vertical nav with icons: Overview, Gigs, Orders, Messages, Earnings, Favorites, Reviews, Settings.
- `StatsCard` — Icon + label + big number + trend indicator.
- `OrderStatusBadge` — Color-coded badges per status.
- `EarningsChart` — Simple bar chart (use a lightweight chart lib or CSS bars).

**Shared:**
- `SearchBar` — Input with search icon, debounced, routes to `/search?q=`.
- `CategoryBar` — Horizontal scrollable pill/chip row of categories (home page).
- `StarRating` — Filled/empty star display + interactive version for review form.
- `EmptyState` — Illustration + message + CTA button.
- `LoadingSkeleton` — Skeleton variants for gig cards, profile, order rows.

### Key Features to Implement

1. **Auth Flow:**
   - Signup → creates auth user + profile (via DB trigger) → redirect to dashboard
   - Login → email magic link or email/password → redirect
   - Protected routes: middleware checks session, redirects to /login if unauthenticated
   - Role toggle: users start as "buyer", can "Become a Seller" from dashboard which sets role to "both"

2. **Home Page:**
   - Hero section: Large heading ("Find the perfect freelance services for your business"), subtext, search bar centered, subtle gradient or illustration background
   - Category bar: Horizontal scroll of category cards with icons
   - Featured Gigs section: 4-8 gig cards marked `is_featured`
   - Trending section: Top gigs by `orders_completed` or `average_rating`
   - "How it Works" 3-step section with icons
   - Testimonial/social proof row

3. **Search & Browse:**
   - `/search?q=term&category=slug&min_price=X&max_price=Y&sort=relevance|newest|popular|price_low|price_high`
   - Sidebar filters: Category, Price range (slider), Delivery time, Seller level
   - Server-side filtering using Supabase queries with `.ilike()` and `.gte()/.lte()`
   - Pagination or infinite scroll

4. **Gig Detail Page:**
   - SSR with `generateMetadata` for SEO
   - Image gallery (1 main + up to 4 thumbnails)
   - 3-tier package comparison table with Tabs
   - "Contact Seller" opens messaging
   - Related gigs carousel at bottom
   - Review section with star breakdown chart

5. **Create/Edit Gig (Multi-step form):**
   - Step 1: Title, category, subcategory, search tags
   - Step 2: Package pricing (basic required, standard/premium optional), delivery days, revisions, features
   - Step 3: Description (textarea/rich text), FAQs
   - Step 4: Image upload (drag-and-drop to Supabase Storage, preview thumbnails, reorder)
   - Step 5: Review & Publish
   - Use `useState` for step tracking, validate each step before advancing

6. **Order Flow:**
   - Buyer selects package on gig page → "Continue" → order confirmation page → "Place Order" (Server Action creates order)
   - Order detail page with status timeline, buyer requirements form, seller delivery form, revision requests
   - Auto-complete 3 days after delivery if buyer doesn't respond
   - After completion, buyer can leave a review

7. **Messaging:**
   - Conversation list on left, chat panel on right
   - Real-time via Supabase Realtime subscriptions on `messages` table
   - File attachments via Supabase Storage

8. **Dark Mode Toggle:**
   - Use `next-themes` ThemeProvider wrapping the app
   - Toggle button in Navbar: Sun icon ↔ Moon icon with smooth transition
   - All components use CSS variables that swap between light/dark values
   - Respect system preference on first visit

9. **Responsive Design:**
   - Mobile-first Tailwind classes
   - Navbar collapses to hamburger on mobile (Sheet component)
   - Gig grid: 1 col on mobile, 2 on sm, 3 on lg, 4 on xl
   - Dashboard sidebar becomes bottom nav or hamburger on mobile
   - Image gallery is swipeable on mobile

10. **Loading States:**
    - Skeleton cards while gig grids load (use shadcn Skeleton)
    - Loading spinners on form submissions
    - Optimistic UI updates for favorites (heart toggle)
    - Suspense boundaries around async server components

### Server Actions (in `src/app/actions/`)

Create separate action files:
- `auth.ts` — signup, update profile
- `gigs.ts` — createGig, updateGig, deleteGig, toggleGigStatus
- `orders.ts` — createOrder, submitRequirements, deliverOrder, requestRevision, completeOrder
- `reviews.ts` — createReview, respondToReview
- `favorites.ts` — toggleFavorite
- `messages.ts` — sendMessage, markAsRead
- `uploads.ts` — uploadImage (to Supabase Storage, return public URL)

All actions must: validate inputs, check auth, use Supabase server client, `revalidatePath()` after mutations, return `{ success, error }`.

### Image Upload Pattern
```typescript
// Server action for image upload
export async function uploadGigImage(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  const ext = file.name.split(".").pop()
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from("gig-images")
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) return { error: error.message }

  const { data: { publicUrl } } = supabase.storage
    .from("gig-images")
    .getPublicUrl(path)

  return { url: publicUrl }
}
```

### Design Principles (throughout)
- **Whitespace is king** — generous padding, never cramped
- **Cards are soft** — `rounded-xl`, `border`, `shadow-sm` on hover only
- **Typography hierarchy** — clear size/weight differences between heading, subheading, body
- **Micro-interactions** — hover border color shifts, button scale on press, smooth page transitions
- **Consistent spacing** — Use Tailwind spacing scale (4, 6, 8, 12, 16, 24)
- **No unnecessary color** — the palette is neutral; color is earned (green for CTAs, amber for stars, red for errors only)

Build the complete application following this specification. Start with project init and Supabase setup, then build the layout (Navbar + Footer + ThemeProvider), then the home page, then auth, then search/browse, then gig detail, then dashboard pages, then gig creation, then orders, then messaging. Each page should be fully functional and connected to Supabase.

## PROMPT END
