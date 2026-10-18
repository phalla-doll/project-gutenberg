---
name: Project Sonam
description: Tactile book discovery in plum, apricot, and lilac.
colors:
  background: "#faf7fb"
  foreground: "#352438"
  primary: "#74436c"
  primary-foreground: "#ffffff"
  primary-active: "#542e4e"
  secondary: "#eadfed"
  secondary-foreground: "#54364f"
  muted: "#e9e0ec"
  muted-foreground: "#6c5870"
  accent: "#e4d5e8"
  border: "#ded0e2"
  input: "#cbb5d0"
  ring: "#905783"
  surface-soft: "#f1eaf3"
  surface-dark: "#352438"
  surface-dark-elevated: "#66445f"
  surface-dark-soft: "#54354f"
  on-dark: "#faf7fb"
  on-dark-soft: "#e3d0df"
  body-text: "#57435a"
  muted-soft: "#735e76"
  hairline-soft: "#e8deeb"
  bookmark: "#f3c3a7"
  cover-field: "#eee3f2"
  destructive: "#b0323b"
  reader-sepia-background: "oklch(0.955 0.024 78)"
  reader-sepia-surface: "oklch(0.918 0.034 75)"
  reader-sepia-text: "oklch(0.27 0.021 64)"
  reader-sepia-muted: "oklch(0.48 0.026 66)"
  reader-sepia-border: "oklch(0.82 0.034 72)"
  reader-dark-background: "oklch(0.18 0.008 84)"
  reader-dark-surface: "oklch(0.235 0.009 84)"
  reader-dark-text: "oklch(0.9 0.006 88)"
  reader-dark-muted: "oklch(0.66 0.01 88)"
  reader-dark-border: "oklch(0.32 0.012 84)"
  reader-light-highlight: "oklch(0.84 0.1 77 / 0.38)"
  reader-light-highlight-active: "oklch(0.8 0.12 62 / 0.58)"
  reader-sepia-highlight: "oklch(0.78 0.1 70 / 0.42)"
  reader-sepia-highlight-active: "oklch(0.73 0.12 58 / 0.62)"
  reader-dark-highlight: "oklch(0.64 0.11 70 / 0.38)"
  reader-dark-highlight-active: "oklch(0.68 0.12 62 / 0.58)"
  opening-plum: "#482b43"
  display-lilac: "#bda6c8"
  display-peach: "#d9b3a6"
  cover-peach: "#f3e4dc"
  cover-lavender: "#e7e5ef"
  invitation-hover: "#ffdbbf"
  jacket-paper: "#f7f1e8"
  page-light: "#f4ecdc"
  page-rule: "#cfc4b5"
typography:
  display:
    fontFamily: "Familjen Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  display-wide:
    fontFamily: "Familjen Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "48px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Familjen Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.375
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
  description-wide:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
  button:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.68rem"
    letterSpacing: "0.05em"
  serif-accent:
    fontFamily: "EB Garamond, Georgia, serif"
  reader:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.85
  reader-serif:
    fontFamily: "Sentient, ui-serif, Georgia, serif"
  reader-soft:
    fontFamily: "Synonym, ui-sans-serif, system-ui, sans-serif"
  invitation:
    fontFamily: "Familjen Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "52px"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  invitation-italic:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "1.12em"
    fontWeight: 400
    letterSpacing: "-0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "18px"
  pill: "999px"
  book: "2px 5px 5px 2px"
  invitation-action: "10px"
  opening-mobile: "20px"
  opening: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  heading: "36px"
  page-mobile: "40px"
  page-wide: "56px"
  home-mobile: "24px"
  home-wide: "32px"
  opening-after: "44px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "rgb(116 67 108 / 0.8)"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "40px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "40px"
  text-input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "4px 0"
    height: "40px"
  header-search:
    backgroundColor: "{colors.surface-dark-elevated}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.md}"
    padding: "4px 0 4px 36px"
    height: "40px"
  top-nav:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark-soft}"
    typography: "{typography.label}"
    height: "64px"
  topic-chip:
    backgroundColor: "{colors.primary-foreground}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  catalog-cover:
    backgroundColor: "{colors.cover-field}"
    rounded: "{rounded.xl}"
  book-dialog:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.2xl}"
  feature-action:
    backgroundColor: "{colors.bookmark}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.invitation-action}"
    padding: "11px 18px"
  discovery-opening:
    backgroundColor: "{colors.opening-plum}"
    textColor: "{colors.background}"
    rounded: "{rounded.opening}"
  book-jacket:
    backgroundColor: "{colors.jacket-paper}"
    rounded: "{rounded.book}"
---

# Design System: Project Sonam

## Overview

**Creative North Star: "The Artist’s Book Exhibition"**

An artist-residency exhibition translated into an approachable reading room. A deep plum shell and invitation, lilac-white ground, and apricot accents frame real books as dimensional objects. Page edges, hinge shading, directional soft shadows, and restrained perspective make discovery tactile without changing familiar catalog controls.

The home opening presents three linked popular books against layered lilac and peach planes. Catalog cards reuse the same jacket treatment, with visible title and author below. The reader stays quiet and adjustable; the book covers themselves supply the imagery, with no generated artwork or decorative grain.

**Key Characteristics:**

- Deep plum orientation and invitation surfaces on a lilac-white ground.
- Apricot navigation bookmarks, invitation action, selection, and expressive italic line.
- Real source covers rendered as dimensional jackets with visible paper edges.
- Familjen Grotesk and Satoshi for clarity; EB Garamond italic for the home invitation.
- A familiar responsive catalog and locally adjustable reader beneath the expressive opening.

`app/globals.css` owns global tokens and component styling. `components/book-jacket.tsx` owns the shared book object, with image failure state isolated in the client `BookCover` component; `components/reader-shell.tsx` owns local reading preferences. The frontmatter records the shipped values, including the semantic opening and paper tokens.

## Colors

### Primary

- **Plum Ink** (`foreground`, `surface-dark`): primary text, navigation shell, selected filters, and missing-cover fallback. **Exhibition Plum** (`opening-plum`) deepens the home invitation surface.
- **Reading Plum** (`primary`): links and ordinary primary actions. Default button hover uses this color at 80% opacity; `primary-active` is a separate existing token.
- **Soft Apricot** (`bookmark`): current navigation underline, selection, skip link, header focus, home action, and invitation italic. The invitation action has its own lighter hover (`invitation-hover`).

### Secondary

- **Lilac and Peach Display Planes** (`display-lilac`, `display-peach`): the layered home book stage. These root tokens describe display surfaces and remain separate from control state colors.
- **Catalog Fields** (`cover-field`, `cover-peach`, `cover-lavender`): three recurring jacket grounds, selected by book ID modulo three. `secondary` and `accent` support metadata and control states.
- **Reader Palettes** (`reader-sepia-*`, `reader-dark-*`): local background, surface, text, muted text, borders, and search highlights. Light reading resolves to the global light palette. All reader OKLCH source values remain intact.

### Neutral

- **Lilac-white Canvas** (`background`), soft surface (`surface-soft`), and white: page ground, footer, popovers, and topic controls.
- **Secondary Plum Text** (`body-text`, `muted-foreground`, `muted-soft`): summaries, authors, and supporting descriptions.
- **Shell Layers** (`surface-dark-elevated`, `surface-dark-soft`, `on-dark`, `on-dark-soft`): search and secondary text on dark plum.
- **Lilac Boundaries** (`border`, `input`, `hairline-soft`) and focus (`ring`): quiet rules and interaction feedback.
- **Jacket Paper** (`jacket-paper`, `page-light`, `page-rule`): book-face base and visible paper-edge stripes. **Error Red** (`destructive`) remains functional.

**The Bookmark Rule.** Use apricot to mark the current navigation destination on desktop and mobile, with the same warm accent supporting the home invitation.

Sidecar tonal ramps are generated preview aids, not new shipping palette steps. Preserve source hex and OKLCH syntax rather than creating a second color authority.

## Typography

**Headings:** Familjen Grotesk. **Body and controls:** Satoshi. **Compact technical/action-menu labels:** JetBrains Mono. **Expressive home invitation:** EB Garamond italic. **Reader choices:** Satoshi by default, with Sentient serif and Synonym sans-serif available locally.

Satoshi, Familjen Grotesk, Sentient, and Synonym are served by `public/fonts/fonts.css`; JetBrains Mono and EB Garamond use `next/font`. The global serif token resolves to EB Garamond with Georgia/serif fallbacks.

- **Home invitation:** medium Familjen Grotesk (52px), leading (1.05), tracking (-0.03em); below large it becomes (42px), and below medium (768px) it becomes (36px). The separate italic line is EB Garamond at (1.12em), reduced to (1em) between medium and large, weight (400), tracking (-0.02em), in apricot. Home copy is (15px/1.65), reducing to (14px) on phones.
- **Shared page headings:** medium (36px/1.25), tracking (-0.025em), increasing to (48px) at small. Home Popular Books is an h2 (30px), increasing to (36px) at small.
- **Catalog titles:** medium Familjen Grotesk (16px/1.375), global heading tracking (-0.02em), clamped to two lines within a reserved (44px) title area so authors align across each row. Authors are Satoshi (14px/1.625), also clamped to two lines.
- **Body:** Satoshi (16px/1.625); shared page descriptions grow to (18px) at small and stop at (42rem). Header links are medium (14px). Ordinary button slots are (13px), weight (600), normal case, zero tracking.
- **Reader:** default Satoshi (18px/1.85), width (38rem); settings allow size (16–24px), leading (1.55–2.15), and width (38–64rem). Reader title is (30px), increasing to (48px) at medium. Title and author precede language/public-domain metadata.

**The Quiet Reading Rule.** Keep the exhibition’s expressive staging in discovery; preserve a calm text column and local reading preferences in the reader.

## Layout

The shared shell and catalog are centered at a maximum (80rem), with horizontal padding (16px), (24px) from small, and (32px) from large. Home vertical padding is (24px), increasing to (32px) from small. Shared page headings retain a bottom margin (36px).

The home opening splits invitation/display at (0.95fr/1.05fr), has a minimum height (350px), and sits (44px) above the catalog heading. The display uses three actual popular books, asymmetric resting angles and offsets, an arched lilac plane, and a lower peach plane. Below medium (768px) it stacks into one column, uses a compact display with minimum height (235px), and leaves (30px) below. The invitation action remains a familiar Browse link. Home title captions are visible at (12px); full title/author names remain accessible on the linked objects.

Catalog columns are **two** below small (640px), **three** from small, **four** from large (1024px), and **five** from extra-large (1280px). Horizontal/vertical gaps are (16px/32px), becoming (24px/40px) from small. Each field is (4:5); its jacket is (63%) wide with a normalized (2:3) aspect ratio. Source art fills the face with `object-fit: cover`. Text begins (16px) below, with (6px) between title and author. Do not confuse the stage aspect ratio with the jacket aspect ratio.

The sticky header is (64px) high. Desktop navigation appears from medium (768px); full search appears from small. Phones use separate (44px) search/menu actions and a bottom navigation drawer. Desktop links are Home, Browse, and Reading Lists; the drawer also includes Search.

Home topics form a wrapping row of controls without a surrounding ruled strip. Browse uses a labeled native topic select on phones and category tabs/topic chips from small. Filter and pagination state stays in URLs.

Book details preserve the cover/action showcase and information regions. Soft book navigation opens the dialog; direct links render a full page. The dialog has maximum width (64rem), maximum height (`100svh - 2rem`), and internal phone scrolling; from medium its height is the smaller of (44rem) and (`100svh - 4rem`). The reader has an adjustable centered column, sticky (56px) toolbar, mobile bottom action strip, and local preferences/progress. Focus mode hides the global header/footer.

## Elevation & Depth

Book depth is a reusable identity device, not a hover-only effect. The shared jacket has a shaded hinge, visible striped paper edge, soft directional shadow, and perspective at rest. Source cover art supplies the face. The home display adds large overlapping tonal planes, while catalog controls retain standard interaction patterns.

**The Real Book Rule.** Build depth around actual catalog covers; keep titles and authors visible outside the object and full names accessible.

- **Jacket face:** `9px 15px 18px -7px rgb(53 36 56 / 0.3)`; subtle inset edge `inset 0 0 0 1px rgb(0 0 0 / 0.08)`.
- **Paper edge:** `2px 2px 1px rgb(53 36 56 / 0.18)`; the striped edge is skewed (8deg).
- **Exhibition plane:** `0 16px 32px -16px rgb(15 5 22 / 0.5)`; **topic controls:** `0 2px 3px rgb(53 36 56 / 0.04)`.
- **Detail preview:** existing `0 18px 34px rgba(20, 20, 19, 0.12), 0 2px 6px rgba(20, 20, 19, 0.06)` plus its inset highlight, pages, spine, and glare.

Catalog jackets rest at `rotateY(-22deg) rotateZ(-3deg)` and lift to `translateY(-8px) rotateY(-8deg) rotateZ(0deg)` over (320ms) with `cubic-bezier(0.22, 1, 0.36, 1)`. The three opening jackets have their own fixed poses; hover uses the same lift. Reduced motion removes transitions and preserves each resting pose. The original detail preview remains pointer-driven with its existing reduced-motion guard.

## Shapes

Ordinary button/input slots use the base radius (8px). Catalog fields use (16px), while the catalog link focus shape remains (12px). Book faces use asymmetric corners (2px 5px 5px 2px). The home opening is (24px), reducing to (20px) on phones; its action is (10px). The display plane combines a broad arch with small lower corners, and the peach plane has an asymmetric upper-left curve. Topics and sorting use pills; subject metadata uses small wrapping rectangles. The book dialog uses the source-derived (18px) radius.

## Components

### Buttons

Default, outline, secondary, ghost, destructive, and link variants remain the established primitives. Ordinary slots use global rounded, (13px), normal-case styling rather than the primitive’s original square/uppercase/tracked values. Default height/padding is (40px)/(0 24px), with (28/36/44px) size variants. Primary uses plum and white; outline/ghost gain a muted hover fill; disabled is noninteractive at 50% opacity. Focus retains the existing ring and global outline.

The home Browse action is a separate apricot-filled link with (11px 18px) padding, minimum height (44px), medium emphasis (14px/600), and a lighter apricot hover. The main navigation drawer uses a scoped override: rounded, normal-case links with a (44px) minimum target. Other drawer wrappers may replace the final data slot and need their own scoped treatment.

### Chips

Discovery topic links use white, a fine lilac border, a soft shadow, secondary plum text (13px/500), padding (6px 14px), and minimum height (36px). Hover changes the fill to `secondary`. Browse topic filters are separate bordered (14px) pills with ink-filled selected states. Metadata subjects wrap within rounded rectangles.

### Cards / Containers

`BookJacket` is the server-rendered shared book object used by both the opening and catalog. Its client `BookCover` renders actual source images, with a titled plum fallback for missing or failed URLs. The fallback uses (12px) padding, (14px) text, and a three-line title clamp. Catalog stages cycle three tones by book ID; title and author sit outside the stage. The entire item is an accessible link, and full names remain available when visible text clamps. The dark Open book pill fades in on hover-capable pointers and keyboard focus without moving layout. Home loading uses skeletons; a resolved empty page shows a short recovery message directing readers to Browse topics.

### Inputs / Fields

Standard inputs are transparent (40px) fields with a bottom boundary, (4px 0) padding, and the base radius. Text is (16px) on phones and (14px) from medium. Focus changes the boundary; invalid/disabled states retain destructive and opacity treatments. Header search uses elevated plum, pale text, no visible border/shadow, a leading icon, and apricot focus.

### Navigation

Header links are medium (14px) Satoshi. Hover/current states brighten; `aria-current="page"` supplies the state. The apricot desktop marker is (4px) high, inset (14px) from each side; mobile uses a (32px × 4px) underline inset (16px) from the left. Header keyboard focus uses an inset apricot outline; featured books use a dark outline against the light display plane. The main navigation drawer has (20px) upper corners, a normal-case (20px) title, and safe-area-aware bottom padding. Preserve skip-to-content and visible keyboard focus.

### Book Details and Reader

Details keep Read online near the download count and preserve the original interactive 3D preview, readable summaries, wrapping metadata, and download actions. Reading settings remain local: Satoshi/Sentient/Synonym, size, line height, width, and light/sepia/dark palettes. The global site remains light; no global theme shortcut is part of this shell. The Librarian remains a bounded reading companion.

## Do's and Don'ts

### Do:

- **Do** use the current global custom properties, with reader palette overrides scoped to the reader.
- **Do** reuse BookJacket for discovery and catalog depth, with actual source covers and visible metadata.
- **Do** preserve two/three/four/five catalog columns and the mobile three-book opening.
- **Do** retain apricot current-location markers, keyboard focus, and reduced-motion behavior.
- **Do** keep the existing Project Sonam logo, source attribution, and honest book metadata.

### Don't:

- **Don't** replace real cover art with generated promotional imagery or decorative grain.
- **Don't** normalize the catalog back to uniform flat blue fields or remove its jacket depth.
- **Don't** hide catalog titles and authors behind hover or make the book link depend on motion.
- **Don't** apply the expressive home invitation typography to every heading or reader paragraph.
- **Don't** turn local reader themes into a global theme switch or assume every drawer wrapper receives the ordinary button-slot override.

The main navigation drawer has explicit scoped styling. Other drawer wrappers retain their own component conventions.
