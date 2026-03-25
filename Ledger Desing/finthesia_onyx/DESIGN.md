# Design System Strategy: The Financial Precision Model

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Architectural Vault."** 

In the world of high-end fintech, trust is not built with blue boxes; it is built through structural integrity and atmospheric depth. We are moving away from the "flat web" and into a space that feels like a premium physical object—think matte black carbon, precision-milled glass, and high-frequency data displays.

To break the "template" look, we employ **Intentional Asymmetry**. Dashboards should not be perfectly mirrored; use larger display-lg typography for primary balances offset against smaller, dense data clusters. We use tonal depth rather than lines to guide the eye, creating a UI that feels "carved" out of the darkness rather than printed on top of it.

## 2. Colors & Surface Logic

This system utilizes a high-contrast light palette designed for legibility and "glow" against deep charcoal.

### The Palette
*   **Background / Base:** `#ffffff` (Surface) — The absolute foundation.
*   **Primary:** `#0dbbd8` — A vibrant blue suitable for buttons, CTAs, and key interactive elements.
*   **Secondary:** `#517e89` — A supporting color for less prominent UI elements, chips, and secondary actions.
*   **Tertiary:** `#fd9d4a` — An additional accent color for highlights, badges, or decorative elements.
*   **Neutral:** `#72787a` — A neutral base color for backgrounds, surfaces, and non-chromatic elements.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts or subtle tonal transitions.
*   *Instead of a line:* Place a `surface_container_low` (`#f0f0f0`) card on top of the `background` (`#ffffff`).
*   *For secondary depth:* Use `surface_container_high` (`#e0e0e0`) to denote active or focused states.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. 
1.  **Level 0 (Base):** `surface`
2.  **Level 1 (Sections):** `surface_container_low`
3.  **Level 2 (Cards/Widgets):** `surface_container`
4.  **Level 3 (Floating Elements):** `surface_container_highest`

### The "Glass & Gradient" Rule
To add "soul" to the financial data:
*   **Glassmorphism:** For floating modals or navigation bars, use `surface_container` at 80% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** Main Action CTAs should use a subtle linear gradient from `primary` (`#0dbbd8`) to `on_primary_container` (`#00612e`) at a 135-degree angle. This prevents the "flat sticker" look.

## 3. Typography: The Editorial Edge

We pair **Manrope** (Headlines) with **Inter** (Data/Body) to balance character with Swiss-style precision.

*   **Display (Manrope):** Use `display-lg` (3.5rem) for total net worth. It should feel authoritative.
*   **Headlines (Manrope):** `headline-md` (1.75rem) for section titles. Use tight letter-spacing (-0.02em) to maintain a "crisp" professional feel.
*   **Body (Inter):** `body-md` (0.875rem) is the workhorse. High legibility for transaction histories.
*   **Labels (Inter):** `label-sm` (0.6875rem) in `on_surface_variant` (`#bacbb9`) for micro-data like timestamps or metadata.

**The Hierarchy Rule:** Never use more than three font sizes on a single card. Contrast should be achieved through weight and color (e.g., `primary` blue for income vs `on_surface_variant` for the date).

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are too "dirty" for a high-end financial app. We use **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking" the surface-container tiers. A `surface_container_lowest` (`#ffffff`) element can be used to create a "recessed" look for input fields, while `surface_bright` (`#393939`) creates a "lifted" look.
*   **Ambient Shadows:** For floating action buttons or high-priority modals, use a shadow with a blur of `32px`, an offset of `Y: 16px`, and an opacity of 6% using the `on_surface` color.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` (`#3b4a3d`) at **15% opacity**. 100% opaque borders are strictly forbidden.

## 5. Components

### Buttons
*   **Primary:** `primary` background, `on_primary` text. Radius: `md` (0.375rem). Use the signature gradient for the default state.
*   **Secondary:** `surface_container_high` background. No border.
*   **Tertiary:** Transparent background, `primary` text. Use only for low-priority actions like "View All."

### Input Fields
*   **Styling:** Use `surface_container_lowest` as the fill. This creates an "etched" look into the interface. 
*   **States:** On focus, the "Ghost Border" becomes 40% opaque `primary`.

### Cards & Lists
*   **Forbid Dividers:** Do not use lines between transactions. Use `1.5` (0.3rem) spacing to group elements and `4` (0.9rem) spacing to separate them.
*   **Transaction Rows:** Use a subtle hover state transition to `surface_container_low`.

### Financial Specials
*   **The "Pulse" Indicator:** Use a 2px glow (using `primary` or `secondary`) for real-time pending transactions.
*   **The Progress Bar:** Track savings goals using `surface_container_highest` as the track and a `primary` to `primary_container` gradient as the fill.

## 6. Do’s and Don’ts

### Do
*   **Do** use `0.5rem` (lg) or `0.75rem` (xl) roundedness for large containers to soften the high-contrast look.
*   **Do** lean into white space. Financial data needs "breathing room" to avoid looking like a spreadsheet.
*   **Do** use the `primary_fixed_dim` for text that sits on top of dark backgrounds to ensure WCAG AAA compliance.

### Don’t
*   **Don’t** use pure `#000000` for backgrounds; it kills the perception of depth. Use `surface` (`#ffffff`).
*   **Don’t** use standard "drop shadows" with 20%+ opacity. They look dated and "heavy."
*   **Don’t** mix the two typefaces within the same line of text. Manrope is for titles; Inter is for the "truth" (the numbers).