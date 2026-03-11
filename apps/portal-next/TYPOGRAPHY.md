# ॥ ॐ श्री गणेशाय नमः ॥
# AITDL Typography System V2 — Usage Reference
# "Ancient Wisdom. Modern Precision."

## Font Stack

| Role       | Font                  | Use For                              |
|------------|-----------------------|--------------------------------------|
| Impact     | Bebas Neue            | Hero, section headlines, CTAs        |
| Display    | Cormorant Garamond    | Taglines, editorial callouts         |
| Body       | Noto Sans             | All body text, UI copy               |
| Label      | Space Grotesk         | Card titles, nav, badges, eyebrows   |
| Mono       | Space Mono            | Meta, timestamps, code, footer       |
| Devanagari | Noto Sans Devanagari  | Hindi and Sanskrit pages             |

---

## Tailwind Class Quick Reference

### Font Family
```
font-impact    → Bebas Neue      (headlines)
font-display   → Cormorant       (editorial)
font-sans      → Noto Sans       (body)
font-label     → Space Grotesk   (labels)
font-mono      → Space Mono      (meta)
font-deva      → Noto Devanagari (hi/sa)
```

### Font Size
```
text-hero      → clamp(4rem → 10rem)   AITDL brand mark
text-tagline   → clamp(1.1rem → 1.75rem) SEE IT. LOVE IT.
text-h1        → clamp(2.5rem → 5rem)  Page hero
text-h2        → clamp(2rem → 3.5rem)  Section title
text-h3        → clamp(1.4rem → 2rem)  Card headline
text-h4        → clamp(1.1rem → 1.4rem) Card sub
text-label     → clamp(0.65rem → 0.75rem) Eyebrow
text-body      → 1rem               Body paragraph
text-small     → 0.875rem           Small UI text
text-meta      → 0.6875rem          Footer/mono meta
```

### Colours
```
text-gold          → #C9A84C  (accent)
text-gold-light    → #E8C96A  (bright gold)
text-text-hero     → #FFFFFF
text-text-primary  → #F5F2EC
text-text-body     → #B0A898
text-text-muted    → #746C60
```

---

## Component Patterns

### Hero Section
```tsx
<div className="badge-cs">AITDL · LIVING KNOWLEDGE</div>
<h1 className="brand-h1 text-hero font-impact tracking-hero">AITDL</h1>
<p className="tagline-scaling">SEE IT. LOVE IT. THEN PAY FOR IT.</p>
```

### Card
```tsx
<span className="card-eyebrow">WHOLE UNIVERSE</span>
<h3 className="card-title">EXPLORE EVERYTHING</h3>
<p className="card-body">All 11 product worlds — Retail, ERP, Education...</p>
```

### Section Headline
```tsx
<h2 className="font-impact text-h2 tracking-heading text-text-primary uppercase">
  YOUR STORE. SMARTER TODAY.
</h2>
```

### Footer Meta
```tsx
<p className="footer-meta">Pan India Since 2007 · Brahmasphuṭasiddhānta 628</p>
```

---

## Hindi / Sanskrit Usage
Classes auto-switch to Noto Sans Devanagari via :lang(hi) and :lang(sa).
No extra classes needed — just set lang attribute on html element.

---

## Section Accent Colour Map
```
Retail     → text-retail    #FF6B1A
ERP        → text-erp       #1A8FFF  
Education  → text-education #22C565
AI         → text-ai        #A259FF
Partner    → text-partner   #39E07A
NGO        → text-ngo       #0EB8A0
LEF        → text-lef       #F5A623
Ecom       → text-ecom      #6C63FF
```
