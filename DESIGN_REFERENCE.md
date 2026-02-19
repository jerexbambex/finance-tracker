# Design Reference Guide - Laravel AI & Plane.so

This document captures the key design elements and patterns from both reference sites that inspired the Budget App landing page redesign.

---

## 🎨 Laravel AI (laravel.com/ai)

### Visual Design Patterns

#### 1. Hero Section
```
Layout:
- Centered content
- Large heading (text-5xl to text-7xl)
- Subheading with clear value prop
- Prominent CTA buttons
- Code snippet or visual below

Typography:
- Bold, clean sans-serif
- Tight line-height (leading-tight)
- Strong hierarchy

Colors:
- Minimal color palette
- Primary color for accents
- Lots of white/dark space
- Subtle gradients (opacity: 10-20%)
```

**Key Headline:**
> "The AI toolkit with batteries included"

**Subheading:**
> "Laravel AI SDK gives you the power to build complete AI‑native applications in a single first‑party package."

**Pattern Applied to Budget App:**
- "Financial management for people who actually want to save"
- "Budget App replaces spreadsheets, expense trackers, and goal planners with one unified workspace"

---

#### 2. Feature Sections

```
Structure:
- Icon + Title + Description
- Code examples showing actual usage
- Animated elements (subtle)
- Grid layout (2-3 columns)

Visual Elements:
- Rounded corners (rounded-xl, rounded-2xl)
- Border styling (border, border-2)
- Card backgrounds (bg-card)
- Hover effects (hover:shadow-lg)
```

**Example Features:**
- "One SDK for every capability"
- "Agents without limits"
- "Stream, broadcast, and queue"
- "Built-in web and file tools"
- "As eloquent as Laravel"
- "Testing tools included"

**Pattern Applied to Budget App:**
- "One workspace with batteries included"
- Feature cards with icons and descriptions
- Hover effects on cards
- Consistent spacing and borders

---

#### 3. Code-Focused Visuals

```
Elements:
- Browser chrome mockups
- Syntax-highlighted code
- Animated code snippets
- Terminal-style displays
- Line numbers and comments
```

**Pattern Applied to Budget App:**
- Dashboard preview with browser chrome
- Three-dot window controls (red, yellow, green)
- Address bar with lock icon
- Realistic UI mockup inside

---

#### 4. Messaging Tone

```
Characteristics:
- Technical but approachable
- Confident without being arrogant
- Feature-focused with benefits
- "Batteries included" philosophy
- Emphasizes completeness
```

**Key Phrases:**
- "with batteries included"
- "One SDK for every capability"
- "without limits"
- "built-in"
- "all in a single file"

---

#### 5. Color & Animation

```css
/* Gradient Backgrounds */
.gradient-blur {
  background: radial-gradient(circle, primary/20, transparent);
  filter: blur(100px);
}

/* Animated Lines (for diagrams) */
.animated-line {
  stroke-dasharray: 0.1 5;
  animation: dash-flow 300ms linear infinite;
}

/* Subtle Hover Effects */
.card:hover {
  border-color: primary/50;
  box-shadow: 0 0 0 1px primary/10;
}
```

---

## 🚀 Plane.so

### Visual Design Patterns

#### 1. Hero Section

```
Layout:
- Bold, provocative headline
- Direct value proposition
- "Cloud, Self-hosted and Airgapped ready" badge
- Dual CTA buttons
- "Replaces" section immediately visible

Typography:
- Extra bold headings
- Tight tracking
- Large font sizes (text-6xl+)
- Strong contrast
```

**Key Headline:**
> "Project management for teams that prefer shipping over configuring"

**Alternative Headlines:**
> "Project management for teams that won't slow down for their software"

**Pattern Applied to Budget App:**
- "Financial management for people who actually want to save"
- Direct, personality-driven copy
- Challenges the status quo

---

#### 2. "Replaces" Section

```
Structure:
REPLACES
[Tool Logo] [Tool Logo] [Tool Logo] [Tool Logo] [Tool Logo]

Visual Style:
- Uppercase "REPLACES" label
- Muted/grayscale logos
- Horizontal layout
- Prominent placement (hero or near hero)
```

**Plane.so Examples:**
- Replaces: Jira, Asana, Linear, ClickUp, Monday
- Replaces: Notion, Google Docs, Confluence, Coda
- Replaces: ChatGPT, Claude, Rovo, ClickUp Brain

**Pattern Applied to Budget App:**
```
REPLACES
[Excel Spreadsheets] [Mint] [YNAB] [Personal Capital] [EveryDollar]
```

---

#### 3. Use Case Tabs

```
Structure:
- Tab navigation (Product, Operations, Marketing, etc.)
- Content area with:
  - Bold headline
  - Description paragraph
  - Feature list with checkmarks
  - Optional visual/screenshot

Interaction:
- Click to switch tabs
- Smooth content transition
- Active state styling
```

**Plane.so Use Cases:**
1. **Product** - "Stop digging through Slack or spreadsheets to figure out what to build next"
2. **Operations** - "Know exactly where every project stands without chasing people for updates"
3. **Marketing** - "Run campaigns faster with strategy, assets, and work sitting in one unified workspace"
4. **Agile** - "Ship predictably when your team stops context-switching"
5. **Design** - "Move designs forward without waiting days for feedback"

**Pattern Applied to Budget App:**
1. **Personal Finance** - "Stop wondering where your money went"
2. **Freelancers** - "Manage irregular income like a pro"
3. **Families** - "Get everyone on the same financial page"

---

#### 4. Stats & Social Proof

```
Structure:
- Large numbers (text-5xl+)
- Descriptive labels
- Customer logos
- Detailed testimonials
- Specific outcomes

Visual Style:
- Bold typography
- Primary color for numbers
- Muted text for labels
- Grid layout
```

**Plane.so Stats:**
- "60% lesser time spent on coordination"
- "75% lesser status meetings"
- "83% fewer internal Slack threads"

**Pattern Applied to Budget App:**
- "73% Less time on finances"
- "$ 2.4K Average savings increase"
- "4.9/5 User satisfaction"

---

#### 5. Testimonials

```
Structure:
- Quote text (detailed, specific)
- User name
- User role/company
- Optional: Avatar or logo

Content Style:
- Specific outcomes mentioned
- Pain points addressed
- Comparison to alternatives
- Authentic voice
```

**Plane.so Example:**
> "I'm honestly just running away from Jira and its thousand-plugin circus. What I really want is simple: subtasks that behave like actual children of a task, not thousands of separate issues flooding my board like they do in Jira. I loveeee Plane where subtasks stay neatly under their parent, have their own work logs, and let me choose different subtask types so easily."
> — Lucas, Recovering Jira survivor

**Pattern Applied to Budget App:**
> "I've tried Mint, YNAB, and Personal Capital. Budget App is the only one I actually stuck with. The UI is gorgeous and it just works."
> — Alex Dore, Freelance Designer

---

#### 6. Bento Grid Layout

```
Structure:
- Grid with varying card sizes
- Some cards span 2 columns
- Some cards span 2 rows
- Asymmetric but balanced

CSS:
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.card-large {
  grid-column: span 2;
  grid-row: span 2;
}

.card-wide {
  grid-column: span 3;
}
```

**Pattern Applied to Budget App:**
- Feature grid with varying sizes
- Smart Budgeting: 2x2 (large)
- Goal Tracking: 1x1
- Insights: 1x1
- Multi-Currency: 3x1 (wide)

---

#### 7. CTA Sections

```
Structure:
- Provocative question headline
- Supporting text
- Dual CTAs (primary + secondary)
- Gradient background
- Large padding

Visual Style:
- Rounded corners (rounded-3xl)
- Border (border-2)
- Gradient overlay
- Shadow effects
```

**Plane.so CTA:**
> "Why are you still putting up with legacy tools?"
> [Switch to Plane] [Talk to Sales]

**Pattern Applied to Budget App:**
> "Why are you still using spreadsheets?"
> "Start managing money the way it should be. Free forever, no credit card required."
> [Get Started Free] [Sign In]

---

#### 8. Messaging Tone

```
Characteristics:
- Bold and confident
- Challenges status quo
- Direct, no fluff
- Action-oriented
- Slightly provocative
- Emphasizes simplicity
```

**Key Phrases:**
- "prefer shipping over configuring"
- "won't slow down for their software"
- "without the struggle"
- "Why are you still..."
- "Stop [pain point]"
- "Finally, [solution]"

---

## 🎯 Combined Design System

### Typography Scale
```
Hero Headline: text-5xl md:text-7xl (48px → 72px)
Section Headline: text-4xl md:text-5xl (36px → 48px)
Card Title: text-2xl (24px)
Body Large: text-xl (20px)
Body: text-base (16px)
Small: text-sm (14px)
Tiny: text-xs (12px)
```

### Spacing Scale
```
Section Padding: py-24 (96px vertical)
Card Padding: p-6 to p-8 (24px → 32px)
Grid Gap: gap-6 (24px)
Element Gap: gap-4 (16px)
Tight Gap: gap-2 (8px)
```

### Border Radius
```
Small: rounded-lg (8px)
Medium: rounded-xl (12px)
Large: rounded-2xl (16px)
Extra Large: rounded-3xl (24px)
Full: rounded-full (9999px)
```

### Color Usage
```
Primary: Accent color (buttons, highlights, stats)
Muted: Secondary text, borders
Background: Main background
Card: Elevated surfaces
Foreground: Primary text
```

### Hover Effects
```css
/* Cards */
.card:hover {
  border-color: primary/50;
  box-shadow: 0 10px 15px -3px primary/10;
  transform: translateY(-2px);
}

/* Buttons */
.button:hover {
  background: primary/90;
  transform: scale(1.05);
}

/* Links */
.link:hover {
  color: foreground;
  text-decoration: underline;
}
```

---

## 📐 Layout Patterns

### Hero Layout
```
┌─────────────────────────────────────┐
│           Badge/Tag                 │
│                                     │
│        Large Headline               │
│        (2-3 lines max)              │
│                                     │
│      Supporting paragraph           │
│                                     │
│    [Primary CTA] [Secondary CTA]    │
│                                     │
│         Replaces Section            │
│    [Tool] [Tool] [Tool] [Tool]      │
│                                     │
│      Trust Badges / Stats           │
│                                     │
│      Dashboard Preview              │
│      (with browser chrome)          │
└─────────────────────────────────────┘
```

### Feature Section Layout
```
┌─────────────────────────────────────┐
│           Section Badge             │
│         Section Headline            │
│       Supporting paragraph          │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │ Feature │ │ Feature │ │Feature│ │
│  │  Card   │ │  Card   │ │ Card  │ │
│  │         │ │         │ │       │ │
│  └─────────┘ └─────────┘ └───────┘ │
│  ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │ Feature │ │ Feature │ │Feature│ │
│  │  Card   │ │  Card   │ │ Card  │ │
│  └─────────┘ └─────────┘ └───────┘ │
└─────────────────────────────────────┘
```

### Use Case Tabs Layout
```
┌─────────────────────────────────────┐
│         Section Headline            │
│                                     │
│  [Tab 1] [Tab 2] [Tab 3] [Tab 4]    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │     Tab Content Card          │  │
│  │                               │  │
│  │  • Feature with checkmark     │  │
│  │  • Feature with checkmark     │  │
│  │  • Feature with checkmark     │  │
│  │  • Feature with checkmark     │  │
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🎨 Color Palette Inspiration

### Laravel AI
```
Primary: Red/Orange (#FF2D20)
Background: White / Dark Gray
Accent: Subtle gradients
Text: Black / White
Borders: Light gray / Dark gray
```

### Plane.so
```
Primary: Purple/Blue
Background: White / Black
Accent: Bright colors for categories
Text: Black / White
Borders: Strong, visible borders
```

### Budget App (Current)
```
Primary: Orange/Red (customizable)
Background: White / Black
Card: Elevated surface
Muted: Gray tones
Borders: Subtle to medium
```

---

## 📱 Responsive Patterns

### Mobile (< 768px)
```
- Single column layouts
- Stacked CTAs
- Smaller typography scale
- Reduced padding
- Tab buttons wrap
- Simplified grids
```

### Tablet (768px - 1024px)
```
- 2 column grids
- Medium typography
- Standard padding
- Side-by-side CTAs
- Tabs in single row
```

### Desktop (> 1024px)
```
- 3+ column grids
- Full typography scale
- Maximum padding
- All features visible
- Bento grid layouts
- Hover effects active
```

---

## ✨ Animation Patterns

### Scroll Animations
```css
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, 
              transform 0.6s ease-out;
}

.fade-in.animate-in {
  opacity: 1;
  transform: translateY(0);
}
```

### Hover Animations
```css
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
```

### Tab Transitions
```css
.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 🔍 Key Takeaways

### From Laravel AI:
1. ✅ "Batteries included" messaging resonates
2. ✅ Clean, minimal design with strategic color use
3. ✅ Code/product visuals build credibility
4. ✅ Technical but approachable tone
5. ✅ Emphasize completeness and integration

### From Plane.so:
1. ✅ Bold, provocative headlines grab attention
2. ✅ "Replaces X" immediately positions product
3. ✅ Use case tabs help users self-identify
4. ✅ Detailed testimonials build trust
5. ✅ Strong visual hierarchy with borders
6. ✅ Confident, action-oriented copy

### Applied to Budget App:
1. ✅ Direct, personality-driven headlines
2. ✅ Clear positioning against alternatives
3. ✅ Persona-specific content (Personal/Freelance/Family)
4. ✅ Outcome-focused stats and testimonials
5. ✅ "Batteries included" philosophy
6. ✅ Provocative CTAs that challenge status quo

---

**This reference guide captures the design DNA of both sites and shows how their best patterns were adapted for Budget App's landing page redesign.**
