# Phase 9B — Pitch Lab Design Overhaul

## Status
Implemented for Pitch Lab only.

## Scope
Phase 9B does not add provider behavior, Network OS work, email, auth, storage, scoring, or new product flows. It improves the founder-facing design system and brand presentation after Phase 9A product-completeness work.

## Locked brand hierarchy

- West Peek mantra: **Good people should meet good people.**
- Pitch Lab product mantra: **Good products need good stories.**
- Product: **West Peek Pitch Lab**
- Feature: **Pitch Practice with Scooter**

## Design direction applied

- Black / white base
- Orange accent only where it creates hierarchy or momentum
- West Peek logo/mark in repo assets
- Premium founder-room feel, not generic SaaS form styling
- Story Card readability preserved
- Consent and trust boundaries preserved
- No numeric scores, fundability ratings, or fake review language

## Canonical assets

- `public/assets/brand/west-peek-logo.svg`
- `public/assets/brand/west-peek-mark.svg`

These are repo-owned brand assets used by the static build and copied into `dist/assets/brand/`.

## Hostile review findings

### Finding 1 — product mantra drift
The earlier line “Good products need good stories.” was directionally fine but not the locked product mantra. It has been replaced in locked runtime copy with **Good products need good stories.**

### Finding 2 — logo placeholder risk
A text-only “West Peek Pitch Lab” brand treatment made the app feel less like the rest of the West Peek app family. The repo now includes West Peek logo assets and renders the logo in the header/footer/favicon path.

### Finding 3 — generic SaaS risk
The design now uses a warmer founder-room layout, larger editorial type, premium cards, black CTAs, and restrained orange accents.

### Finding 4 — design must not hide boundaries
The trust boundary, consent language, no-guarantee language, no-email posture, and talking-Scooter core media posture remain visible after the design pass.

## Not proven

- Pixel-perfect match to other Join West Peek apps.
- Human visual approval.
- Headed Playwright behavior.

Those are candidates for Phase 9D Master Gauntlet / local headed run.

## 2026-06-16 Visual Supersession

The original Phase 9B card/grid layout is superseded by the persistent coaching-room UI contract. The West Peek palette, approved assets, trust boundaries, and no-theater requirements remain active.
