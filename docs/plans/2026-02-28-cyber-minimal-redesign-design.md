# Plugd Cyber-Minimal Redesign

## Scope
5 core pages + shared component library + design system tokens. Inner dashboard pages inherit new tokens/globals but aren't individually redesigned.

## Design System
- Base: #0a0f1a, Surface: #0f172a, SurfaceLight: #1e293b
- Neon: #00ff9d (primary), Cyan: #06b6d4 (secondary)
- Glass: rgba(15,23,42,0.65) bg, rgba(255,255,255,0.08) border
- Fix all undefined tailwind tokens (glass-bg, glass-border, font-heading, font-button, primary-hover)
- Inter variable font via next/font

## Shared Components
- AnimatedBackground: 2-3 gradient orbs, Framer Motion, blur-[140px], 8-12s loops
- GlassCard: backdrop-blur-2xl, hover lift+glow
- GradientButton: neon gradient, shimmer on hover
- GhostButton: glass secondary button
- FloatingInput: floating labels, neon focus ring
- Navbar: fixed, glass on scroll, logo left, Dashboard pill right

## Pages
1. Landing: fixed navbar, gradient hero headline, dual CTAs, glass how-it-works, bento features, testimonials, dashboard teaser
2. Login: centered glass card, floating inputs, eye toggle, Plugd Advantage teaser
3. Signup: segmented role toggle (Founder|Setter), glass card, floating inputs
4. Layout: AnimatedBackground wrapper, noise overlay, Inter font
5. Dashboard shell: glass sidebar, stat widgets, Plugd branding

## Micro-interactions
- Buttons: whileHover scale 1.02 + shimmer
- Cards: whileHover y:-4 + neon glow shadow
- Sections: whileInView fade-up stagger
- Background orbs: infinite position/scale animation
