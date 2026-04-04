# Design System Strategy: Modern Mediterranean B2B

## 1. Overview & Creative North Star: "The Digital Sommelier"
This design system moves away from the sterile, "bootstrap" look of traditional B2B wholesalers. Our Creative North Star is **The Digital Sommelier**: a persona that is authoritative, impeccably organized, and deeply rooted in Mediterranean heritage. 

To achieve this, the system rejects the "boxed-in" grid. We utilize **intentional asymmetry** and **tonal depth** to guide the eye. Instead of rigid borders, we use expansive white space and shifting surface values to create an editorial layout that feels as premium as the high-end hospitality industry it serves. The goal is "Effortless Efficiency"—a high-density ordering environment that feels like a crisp, sun-drenched terrace in the Aegean.

---

## 2. Colors & Surface Philosophy
The palette is a sophisticated interplay of deep Aegean blues (`primary`), crisp whites (`surface`), and fertile olive accents (`secondary`).

### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are prohibited for sectioning.** Structural boundaries must be defined solely through background color shifts.
*   **Method:** A product category section (`surface-container-low`) should sit directly on the main page background (`surface`) without a stroke. Use vertical spacing (Scale `8` to `12`) to allow the eye to reset between modules.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, heavy-stock paper.
*   **Base:** `surface` (#f8f9fa) for the main canvas.
*   **Navigation/Sidebars:** `surface-container-low` (#f3f4f5) to create a subtle recessed feel.
*   **Active Workspaces/Cards:** `surface-container-lowest` (#ffffff) to make high-density order lists "pop" with maximum contrast.
*   **Modals/Overlays:** Use `surface-bright` with a backdrop blur to create a premium "frosted glass" effect.

### The "Glass & Gradient" Rule
Flatness is the enemy of premium design. 
*   **CTAs:** Main 'Quick Reorder' buttons should utilize a subtle linear gradient from `primary` (#003461) to `primary_container` (#004b87) at a 135-degree angle. This adds "soul" and a tactile, clickable quality.
*   **Floating Elements:** Use Glassmorphism for floating action buttons or cart summaries. Combine `surface` at 80% opacity with a `12px` backdrop blur to let food photography bleed through softened edges.

---

## 3. Typography: The Editorial Balance
We pair the geometric authority of **Manrope** for brand moments with the utilitarian precision of **Inter** for commerce.

*   **Display & Headlines (Manrope):** Use `display-lg` and `headline-md` for landing moments and category headers. These should feel like a high-end food magazine—bold, spacious, and confident.
*   **The Ordering Engine (Inter):** All functional data—SKUs, pricing, and stock levels—must use `body-md` or `label-md`. 
*   **Hierarchy Tip:** Use `on_surface_variant` (#424750) for secondary metadata (e.g., "In stock: 40 units") to ensure it doesn't compete with the `primary` blue price points.

---

## 4. Elevation & Depth
In this design system, depth is organic, not artificial.

*   **Tonal Layering:** Avoid shadows for standard cards. Instead, place a `surface-container-lowest` card on a `surface-container-low` background. The slight shift in brightness creates a "Soft Lift."
*   **Ambient Shadows:** For elevated states (like a dragged order line item), use an extra-diffused shadow: `0px 20px 40px rgba(0, 52, 97, 0.06)`. Note the use of the `primary` color in the shadow to mimic natural, blue-tinted Aegean light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in input fields, use `outline_variant` (#c2c6d1) at **20% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary (Quick Reorder):** Gradient filled (`primary` to `primary_container`), `xl` (0.75rem) roundedness. Typography: `title-sm` (Inter, Semibold).
*   **Secondary:** Ghost style. No background, `outline` token at 20% opacity, `primary` text.

### High-Density Lists (The Order Engine)
*   **Layout:** Forbid divider lines. Use `8px` of vertical white space between rows.
*   **Zebra Striping:** Use `surface-container-low` for every second row to maintain readability in 50+ item lists.
*   **Status Indicators:** Use `secondary` (Olive) for "Delivered" and `primary_fixed` (Light Blue) for "Processing." Avoid "traffic light" reds/yellows unless there is a critical error.

### Input Fields
*   **Style:** Minimalist. No bottom line or full box. Use a `surface-container-high` background with `sm` (0.125rem) roundedness. 
*   **Focus State:** A 2px "Ghost Border" using `primary` at 40% opacity.

### Featured Photography Chips
*   Instead of standard square thumbnails, use `lg` (0.5rem) roundedness for food imagery to soften the business-heavy UI.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins. For example, a header might be offset to the left while the "Quick Reorder" action sits on a floating glass card on the right.
*   **Do** prioritize `primary` (#003461) for all interactive elements to build a pattern of trust.
*   **Do** use `secondary` (Olive) sparingly—only for success states or "Freshness" highlights.

### Don't:
*   **Don't** use 100% black text. Always use `on_surface` (#191c1d) to maintain a softer, high-end feel.
*   **Don't** use standard "Drop Shadows." If a component needs to float, it needs a blurred background and a tinted ambient shadow.
*   **Don't** crowd the interface. If the density feels too high, increase the `surface-container` padding rather than adding lines. White space is a functional tool for clarity.