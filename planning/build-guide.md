# GigFlow — Build Guide

## Part 3: Extra Suggestions to Reach Functional MVP Faster

These 8 high-impact additions stay faithful to the Fiverr clone vision while filling gaps that make the difference between a demo and a usable product. Each includes the exact follow-up prompt to paste into Cascade.

---

### 1. Stripe Connect Integration for Real Payments

> **Prompt:** "Integrate Stripe Connect for the payment flow. When a buyer clicks 'Place Order', create a Stripe Checkout Session with the gig price + 10% platform fee. On successful payment, create the order in Supabase and redirect to the order detail page. Use Stripe Connect Express for seller onboarding so sellers can receive payouts directly. Add a webhook handler at `/api/webhooks/stripe` that listens for `checkout.session.completed` and `transfer.created` events. Store the Stripe account ID on the seller profile."

### 2. Real-Time Notifications with Supabase Realtime

> **Prompt:** "Add a real-time notification system using Supabase Realtime. Create a `useNotifications` hook that subscribes to INSERT events on the notifications table for the current user. Show a notification bell icon in the Navbar with an unread count badge (red dot with number). Clicking it opens a dropdown showing the last 10 notifications with type icons (order, message, review, system), title, time ago, and read/unread styling. Mark notifications as read on click. Also add toast notifications (using shadcn Toast) when a new notification arrives in real-time."

### 3. Advanced Search with Autocomplete + Filters

> **Prompt:** "Enhance the search experience. Add a search autocomplete dropdown that appears as the user types — showing matching gig titles, categories, and seller names with icons differentiating each type. Use Supabase's pg_trgm extension for fuzzy matching. On the search results page, add a collapsible filter sidebar with: category multi-select checkboxes, price range slider (min/max), delivery time options (24h, 3 days, 7 days, any), seller level filter (new, level 1, level 2, top rated), minimum rating slider. All filters update URL search params so results are shareable and bookmarkable. Add sort options: Best Selling, Newest, Price Low-High, Price High-Low."

### 4. Seller Analytics Dashboard with Charts

> **Prompt:** "Build a seller analytics page at `/dashboard/analytics`. Show: (1) An earnings chart (last 30 days bar chart showing daily earnings, built with pure CSS or a lightweight chart library like recharts), (2) Impressions vs clicks line chart for gig performance, (3) Top performing gigs table with views/orders/conversion rate columns, (4) Response time average card, (5) Order completion rate donut chart, (6) Revenue breakdown by gig. Use Supabase aggregate queries (COUNT, SUM, AVG with date filters). Add date range picker (This Week / This Month / Last 3 Months / All Time) that refetches all data."

### 5. Custom Order / Brief Request System

> **Prompt:** "Add a 'Request Custom Order' flow. On any gig detail page, add a 'Get a Custom Offer' button next to the package tabs. Clicking it opens a dialog where the buyer describes their requirements, sets a budget range, and selects a deadline. This creates a custom_order_requests entry in Supabase and sends a message to the seller's inbox. The seller can then respond with a custom offer (custom price, delivery days, description) which the buyer can accept or negotiate. Add a `custom_order_requests` table with: buyer_id, seller_id, gig_id, description, budget_min_cents, budget_max_cents, deadline, status (pending/offered/accepted/declined). Show pending requests in the seller's dashboard."

### 6. Order Activity Timeline + Delivery System

> **Prompt:** "Build a detailed order activity page at `/dashboard/orders/[id]`. Show a vertical timeline on the left with all events: order placed, requirements submitted, seller started working, delivery uploaded, revision requested, completed, review left. Each timeline entry has an icon, timestamp, and description. On the right panel, show: (1) For sellers — a 'Deliver Work' form with file upload (multiple files to Supabase 'deliveries' bucket) and a message. (2) For buyers — 'Accept Delivery' or 'Request Revision' buttons with a revision note textarea. (3) Both see a chat section at the bottom for order-specific communication. Show a progress bar at the top indicating order status. Add countdown timer showing time remaining until delivery deadline."

### 7. SEO-Optimized Gig Pages with Open Graph

> **Prompt:** "Add full SEO optimization. For each gig detail page, generate dynamic metadata using `generateMetadata` with: title (gig title + seller name), description (first 160 chars of gig description), OpenGraph image (gig thumbnail), structured data (JSON-LD for Product schema with price, rating, review count). Add a dynamic sitemap at `/sitemap.xml` using Next.js's sitemap generation that includes all active gigs, categories, and seller profiles. Add `robots.txt`. On the home page, add SEO-friendly heading tags (h1 for hero, h2 for sections). Ensure all images have alt text. Add canonical URLs to prevent duplicate content."

### 8. Gig Comparison + Buyer Decision Helpers

> **Prompt:** "Add a gig comparison feature. On each GigCard, add a 'Compare' checkbox. When 2-3 gigs are selected, show a sticky bottom bar with 'Compare X Gigs' button. Clicking it opens a full-screen comparison table showing side-by-side: gig images, seller info, all three package prices, delivery times, revision counts, feature lists, ratings, and review counts. Also add 'Recently Viewed' gigs section on the home page (stored in localStorage) and a 'Similar Gigs' carousel on each gig detail page (query by same category + similar price range, exclude current gig)."

---

## Part 4: Step-by-Step Cascade Workflow

Complete sequence to build the full app in under 2 hours. Each step is one Cascade prompt session. Wait for each to complete before starting the next.

---

### Step 1: Project Setup + Supabase Config (10 min)

```
Initialize the project:
1. Run: npx create-next-app@latest gigflow --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
2. cd gigflow && npx shadcn@latest init (New York style, Slate, CSS variables yes)
3. Add shadcn components: button card input textarea select badge avatar dropdown-menu dialog sheet tabs separator skeleton toast tooltip switch label
4. npm install @supabase/supabase-js @supabase/ssr lucide-react next-themes

Create these Supabase utility files:
- src/lib/supabase/client.ts — browser client using createBrowserClient
- src/lib/supabase/server.ts — server client using createServerClient with cookie helpers
- src/middleware.ts — refreshes Supabase auth session on every request, redirects unauthenticated users from /dashboard/* to /login

Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY placeholders.

Set up the ThemeProvider using next-themes in the root layout.
Set up Inter font from next/font/google.
Add the CSS variables for light/dark mode in globals.css per the color system in the master prompt.
```

### Step 2: Layout — Navbar + Footer (10 min)

```
Build the global layout components:

1. Navbar (src/components/navbar.tsx):
   - Sticky top, white bg light / #0F0F0F dark, bottom border
   - Left: Logo text "GigFlow" in font-bold
   - Center: Search bar (expandable on click, debounced, navigates to /search?q=)
   - Right: Dark mode toggle (Sun/Moon icons), and either:
     - Logged out: "Sign In" + "Join" buttons
     - Logged in: Notification bell with unread dot, avatar dropdown (Dashboard, Profile, Become a Seller, Sign Out)
   - Mobile: Hamburger → Sheet with all nav items
   - Use Supabase server client to check auth state

2. Footer (src/components/footer.tsx):
   - 4-column grid: Categories, About, Support, Community
   - Bottom bar: © 2026 GigFlow, social icons (Twitter, Instagram, LinkedIn)
   - Subtle border-top, muted text colors

3. Root layout (src/app/layout.tsx):
   - Inter font, ThemeProvider, Navbar at top, {children}, Footer at bottom
   - Wrap in Supabase auth state management
```

### Step 3: Home Page (15 min)

```
Build the home page at src/app/page.tsx:

1. Hero Section:
   - Full-width, py-24 padding, #F8F9FA bg light / #0F0F0F dark
   - Large h1: "Find the perfect freelance services for your business" (text-4xl md:text-5xl font-bold tracking-tight)
   - Subtitle in muted gray
   - Centered search bar (large, with search icon and green "Search" button)
   - Subtle decorative elements (soft gradient circles or grid pattern bg)

2. Category Bar:
   - Horizontal scrollable row of category cards
   - Each: icon + name, rounded-xl, hover border color change
   - Fetch categories from Supabase, server component

3. Featured Gigs Section:
   - "Featured Services" heading
   - 4-column grid of GigCard components
   - Fetch from Supabase where is_featured = true, limit 8

4. Trending Section:
   - "Trending Services" heading
   - Same grid, ordered by orders_completed DESC, limit 8

5. "How It Works" Section:
   - 3 cards: "Search" (Search icon) → "Compare" (BarChart icon) → "Order" (ShoppingBag icon)
   - Each with icon, title, short description

Create the GigCard component (src/components/gig-card.tsx):
   - Rounded-xl card with overflow-hidden
   - aspect-video image with heart overlay button (favorite toggle)
   - Seller row: avatar (24px circle) + username + seller level badge
   - Title: font-medium, line-clamp-2
   - Bottom row: star icon + rating + (review count) on left, "From $XX" bold on right
   - Hover: shadow-md elevation, border color shift
   - Skeleton loading variant
```

### Step 4: Auth Pages (10 min)

```
Build authentication:

1. Login page (src/app/(auth)/login/page.tsx):
   - Centered card, max-w-md
   - Logo at top
   - Email input + "Send Magic Link" button (primary)
   - Divider "or"
   - Email + password fields + "Sign In" button
   - Link to signup: "Don't have an account? Join"
   - Server action that calls supabase.auth.signInWithOtp() or signInWithPassword()

2. Signup page (src/app/(auth)/signup/page.tsx):
   - Centered card, max-w-md
   - Fields: Full Name, Email, Username, Password, role selector (Buyer/Seller radio or toggle)
   - "Create Account" button (green CTA)
   - Server action: supabase.auth.signUp() with metadata (username, full_name, role)
   - Link to login: "Already have an account? Sign In"

3. Auth callback (src/app/auth/callback/route.ts):
   - Exchange code for session
   - Redirect to /dashboard

4. Update middleware to protect /dashboard/* routes
```

### Step 5: Search + Category Browse (10 min)

```
Build search and category pages:

1. Search page (src/app/search/page.tsx):
   - Server component that reads searchParams (q, category, min_price, max_price, sort, seller_level, delivery_time)
   - Left sidebar (hidden on mobile, Sheet on mobile): category checkboxes, price range inputs, delivery time radios, seller level checkboxes
   - Main area: result count, sort dropdown (Best Selling, Newest, Price Low-High, Price High-Low), gig card grid
   - Supabase query: filter by search_tags ilike or title ilike, category_id match, price range, order by sort param
   - Pagination: "Load More" button or page numbers

2. Category page (src/app/categories/[slug]/page.tsx):
   - Fetch category by slug, show name + description as header
   - Subcategory pills below header (clickable filters)
   - Gig card grid for that category, with same sort options
   - Reuse GigCard component
```

### Step 6: Gig Detail Page (15 min)

```
Build the gig detail page at src/app/gig/[id]/page.tsx:

Server component with generateMetadata for SEO.

Layout: 2-column on desktop (content left ~65%, sidebar right ~35%), single column on mobile.

Left Column:
1. Image Gallery — main image (aspect-video, rounded-xl), thumbnail strip below (up to 5, click to swap main)
2. Seller summary row — avatar, name, level badge, "Contact Me" button, star rating
3. "About This Gig" — full description rendered from markdown/text
4. FAQ accordion (collapsible Q&A from gig_faqs table)
5. Reviews section:
   - Overall rating big number + stars
   - Rating breakdown (5-star to 1-star progress bars with counts)
   - Individual review cards: reviewer avatar + name + country flag, star rating, date, comment text
   - Pagination for reviews

Right Column (sticky sidebar):
1. Package Tabs (shadcn Tabs — Basic / Standard / Premium):
   - Each tab shows: package name, price ($XX), delivery time, revisions, feature checklist (checkmarks)
   - "Continue ($XX)" green CTA button at bottom of each tab
2. Seller Card below tabs:
   - Larger avatar, full name, tagline, "Member since", response time, languages
   - "Contact Me" button

Fetch gig with related data: seller profile, images, FAQs, reviews (paginated).
```

### Step 7: Dashboard Layout + Overview (10 min)

```
Build the dashboard:

1. Dashboard layout (src/app/dashboard/layout.tsx):
   - Left sidebar (240px) with nav items + icons:
     Overview (LayoutDashboard), Gigs (Package), Orders (ShoppingCart), Messages (MessageSquare),
     Earnings (DollarSign), Favorites (Heart), Reviews (Star), Settings (Settings)
   - Active item has bg accent + bold text
   - Mobile: sidebar becomes a bottom nav bar or hamburger Sheet
   - Main content area with padding

2. Overview page (src/app/dashboard/page.tsx):
   - 4 StatsCards row: Active Gigs, Pending Orders, Earnings This Month, Average Rating
   - Each card: icon, label, big number, subtle trend arrow (green up / red down)
   - Recent Orders table (last 5): order number, buyer/seller, gig title, amount, status badge, date
   - "View All" links

Protected by middleware — redirect to /login if no session.
```

### Step 8: Gig Management — List + Create (15 min)

```
Build gig management:

1. My Gigs list (src/app/dashboard/gigs/page.tsx):
   - Table: thumbnail, title, impressions, clicks, orders, rating, status badge (active/paused/draft), actions (edit/pause/delete)
   - "Create New Gig" button top-right (green CTA)
   - Empty state if no gigs

2. Create Gig (src/app/dashboard/gigs/new/page.tsx):
   - Multi-step form with progress indicator (Step 1/5 dots or breadcrumb)
   - Step 1 — Overview: title input, category select, subcategory select (dynamic based on category), search tags (comma-separated input that creates chips)
   - Step 2 — Pricing: Basic tier (always shown), Standard + Premium tiers (toggle to enable). Each: name, description, price ($), delivery days, revisions, features (add/remove list)
   - Step 3 — Description: large textarea for gig description, FAQ builder (add question/answer pairs)
   - Step 4 — Gallery: drag-and-drop image upload zone, uploads to Supabase Storage 'gig-images' bucket, shows thumbnails with delete/reorder, max 5 images, first image becomes thumbnail_url
   - Step 5 — Review: summary of all entered data, "Publish Gig" button

   Use useState for step tracking and all form data. Server action on final submit creates gig + gig_images + gig_faqs in Supabase. Redirect to /dashboard/gigs on success.

3. Edit Gig (src/app/dashboard/gigs/[id]/edit/page.tsx):
   - Same form as create, pre-filled with existing data
   - Fetches gig on mount, updates via Server Action
```

### Step 9: Orders + Reviews (10 min)

```
Build order management:

1. Orders list (src/app/dashboard/orders/page.tsx):
   - Tab filters: All, Active, Delivered, Completed, Cancelled
   - Table: order number, gig thumbnail + title, other party (buyer or seller name), price, due date, status badge, "View" link
   - Fetch based on role: seller sees orders where seller_id = user, buyer sees buyer_id = user

2. Order detail (src/app/dashboard/orders/[id]/page.tsx):
   - Status timeline at top (visual steps: Placed → In Progress → Delivered → Completed)
   - Order info card: gig, package, price, delivery date, revisions
   - Buyer: "Submit Requirements" form (if not yet submitted), "Accept Delivery" / "Request Revision" buttons (when delivered)
   - Seller: "Deliver Work" form with file upload + message (when in_progress/revision)
   - Activity log / chat section at bottom
   - Server actions for each state transition

3. Review form: After order completed, buyer sees "Leave a Review" card with star inputs (overall, communication, service, recommendation) + comment textarea. Server action creates review and updates gig rating.
```

### Step 10: Messaging + Final Polish (10 min)

```
Build messaging and polish:

1. Messages page (src/app/dashboard/messages/page.tsx):
   - Left panel: conversation list (avatar, name, last message preview, time, unread dot)
   - Right panel: chat messages (bubbles, alternating alignment for sent/received, timestamps)
   - Message input at bottom with send button
   - Use Supabase Realtime subscription for live updates
   - "Contact Seller" from gig page creates/opens conversation

2. Favorites page (src/app/dashboard/favorites/page.tsx):
   - Grid of saved gig cards
   - Heart icon removes from favorites
   - Empty state: "No saved gigs yet. Browse the marketplace to find services you love."

3. Settings page (src/app/dashboard/settings/page.tsx):
   - Profile section: avatar upload, full name, username, bio, tagline, country, languages, skills
   - Account section: email (read-only), change password
   - Save button with Server Action

4. Seller profile page (src/app/[username]/page.tsx):
   - Public page: cover area, avatar, name, tagline, level badge, member since, stats (completed orders, rating)
   - "Active Gigs" grid below
   - Reviews section

5. Final Polish:
   - Add Suspense boundaries with Skeleton fallbacks on all async pages
   - Add error.tsx boundaries
   - Add not-found.tsx pages
   - Test all auth flows, CRUD operations, and navigation
   - Verify dark mode works on every page
   - Run `next build` to ensure no errors
```

---

### Total Estimated Prompts: 10 sessions
### Focus: Get steps 1-6 working first (core marketplace), then 7-10 (dashboard + social features)
