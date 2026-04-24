---
name: Aetheric Foundry
colors:
  surface: '#0d1514'
  surface-dim: '#0d1514'
  surface-bright: '#333b39'
  surface-container-lowest: '#08100e'
  surface-container-low: '#161d1c'
  surface-container: '#1a2120'
  surface-container-high: '#242b2a'
  surface-container-highest: '#2f3635'
  on-surface: '#dce4e2'
  on-surface-variant: '#bacac6'
  inverse-surface: '#dce4e2'
  inverse-on-surface: '#2a3230'
  outline: '#849491'
  outline-variant: '#3b4a47'
  surface-tint: '#1cdecc'
  primary: '#7bffee'
  on-primary: '#003732'
  primary-container: '#2ee5d3'
  on-primary-container: '#00625a'
  inverse-primary: '#006a61'
  secondary: '#ddb7ff'
  on-secondary: '#490080'
  secondary-container: '#6f00be'
  on-secondary-container: '#d6a9ff'
  tertiary: '#d0fa00'
  on-tertiary: '#2a3400'
  tertiary-container: '#b7dc00'
  on-tertiary-container: '#4d5e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#51fbe8'
  primary-fixed-dim: '#1cdecc'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#caf300'
  tertiary-fixed-dim: '#b0d500'
  on-tertiary-fixed: '#171e00'
  on-tertiary-fixed-variant: '#3e4c00'
  background: '#0d1514'
  on-background: '#dce4e2'
  surface-variant: '#2f3635'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 32px
  gutter: 24px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

This design system targets high-end enterprise users and AI researchers who require an environment that feels both intellectually powerful and effortlessly lightweight. The brand personality is "Cerebral Futurism"—a blend of high-performance utility and organic digital evolution.

The visual style is a hybrid of **Advanced Glassmorphism** and **Minimalism**. It avoids the heavy, opaque "blocks" of traditional SaaS, instead opting for layered translucency that suggests depth and infinite computational space. Every interaction should feel like manipulating light rather than clicking physical buttons. The emotional goal is to evoke a sense of mastery, calm, and precision.

## Colors

The palette is rooted in a deep "Midnight Graphite" spectrum. The background is not pure black, but a very dark navy-charcoal that allows for better perception of blurred layers.

- **Primary (Teal):** Used for primary actions and "Active Intelligence" states.
- **Secondary (Amethyst):** Used for creative AI outputs and secondary highlights.
- **Tertiary (Electric Lime):** Reserved for high-priority alerts or "Success" states to provide a sharp, organic contrast.
- **Surface Tones:** A progression of graphite grays with subtle blue undertones (Midnight Blue) used to define depth without relying on heavy borders.

## Typography

This design system utilizes a high-contrast typographic hierarchy. **Space Grotesk** is used for headlines to provide a technical, futuristic edge with its geometric apertures. It should be set with tight letter-spacing for large display sizes.

**Inter** handles all functional UI text and long-form data reading. It is selected for its exceptional legibility at small sizes and its neutral character, which balances the bold personality of the headlines. Capitalized labels should be used sparingly for metadata and section headers to maintain an organized, systematic feel.

## Layout & Spacing

The system follows a **Fluid Grid** model with a heavy emphasis on "Negative Space" as a functional element. Layouts are built on an 8px base unit. 

Main application interfaces should utilize a 12-column grid for dashboard views, but content-heavy AI chat or editor views should adopt a centered, narrow-max-width layout to minimize eye strain. Use generous margins (32px+) to allow the glassmorphic panels to "breathe" against the dark background. Components should be grouped into logical "clusters" using the stacking variables to create a clear information hierarchy.

## Elevation & Depth

Depth is the defining characteristic of this design system. It is achieved through three specific techniques:

1.  **Backdrop Blurs:** Every panel must use a `backdrop-filter: blur(20px)`. The background opacity of panels should be kept between 40% and 70% using the Graphite hex.
2.  **Inner Glows:** Instead of outer shadows, use subtle 1px inner borders (top and left) with a low-opacity white or primary color to simulate light catching the edge of a glass pane.
3.  **Active Bloom:** Focused or active elements should emit a soft "bloom" (a Gaussian blur of the accent color) behind the element, rather than a traditional drop shadow. This makes the UI feel like it is powered by light.

## Shapes

The shape language is "Squircle-based" and highly refined. A medium roundedness (8px - 16px) is standard for most containers to maintain a modern, friendly feel while remaining professional.

- **Standard UI elements (Buttons, Inputs):** 8px radius.
- **Main Panels & Cards:** 16px to 24px radius to emphasize the "object-like" quality of the glass containers.
- **AI Avatars/Icons:** Use organic, slightly irregular paths or perfect circles to contrast with the rigid grid.

## Components

### Buttons
- **Primary:** Solid Teal background with black text for maximum contrast. No border.
- **Ghost:** Transparent background with a 1px border of Teal at 30% opacity. On hover, the border glows.

### Inputs & Text Fields
- Fields are dark, semi-transparent graphite. 
- On focus, the border transitions to a Teal-to-Purple gradient with a subtle 4px outer glow (bloom).

### Cards
- Cards must use the Glassmorphism stack: `background: rgba(30, 41, 59, 0.5)`, `backdrop-filter: blur(20px)`, and a `1px` border of `white/10%`.

### Chips & Tags
- Used for AI-generated categories. These should be pill-shaped with a low-opacity background of the secondary Amethyst color and high-saturation text.

### Progress & Loading
- Utilize "Liquid" animations—smooth, organic transitions between states rather than mechanical bars. Use the Tertiary Lime for completion states to provide high-energy feedback.