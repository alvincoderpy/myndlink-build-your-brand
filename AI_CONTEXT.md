# MyndLink – AI Context

## Product
MyndLink is a Shopify-like SaaS that helps users create online stores and sell products.
Core feeling: "Selling online is possible."

## Stack
- Vite + React + TypeScript
- React Router
- Tailwind CSS + shadcn/ui
- Supabase (auth + stores)
- React Query
- i18n with i18next

## App routes (key)
- /dashboard => Home (Shopify-like onboarding page)
- /dashboard/store/edit => Store Editor
- /dashboard/products => Products

## Current priority
Build a professional Shopify-like SaaS design system by defining design tokens
and mapping them into Tailwind theme (colors, radius, spacing, shadows, typography).

## Design reference
Shopify Admin UI: minimal, neutral, calm, spacious. Card-based layout.
Color is used mostly for actions (primary button), not decoration.

## Rules
- Prefer tokens and CSS variables over hardcoded values.
- Avoid magic numbers in padding/gap; use a spacing system.
- Keep UI calm: subtle borders, very soft shadows, clean typography.
