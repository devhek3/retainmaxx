# RetainMaxx — Lean Mobile Design System

## 1. Product Direction

RetainMaxx should feel:

- Simple
- Modern
- Trustworthy
- Mobile-first
- Clean and lightweight
- Easy to understand for non-technical users

The visual principle is:

**White provides the canvas. Purple represents brand, action, and emphasis.**

The interface should prioritize clarity over decoration.

---

# 2. Design Foundation

## Component System

**shadcn/ui**

Use shadcn components as the default foundation instead of creating custom primitives.

Customize:

- Colors
- Typography
- Radius
- Spacing
- Component variants

Avoid modifying component behavior unless there is a clear product-specific requirement.

Create custom RetainMaxx components only when the same combination of shadcn primitives is reused repeatedly.

---

## Icons

**Lucide Icons**

Guidelines:

- Default size: `20–24px`
- Stroke: approximately `2px`
- Use outline icons consistently
- Avoid mixing multiple icon libraries
- Active icons can use primary purple
- Inactive icons use muted foreground colors

---

## Typography

**Inter**

Use one primary typeface throughout the application.

### Type Scale

| Style         | Size | Weight |
| ------------- | ---: | -----: |
| Display       | 32px |    700 |
| Page Title    | 24px |    700 |
| Section Title | 18px |    600 |
| Body          | 16px |    400 |
| Body Emphasis | 16px |    600 |
| Secondary     | 14px |    400 |
| Caption       | 12px |    400 |

Avoid unnecessary typography variants.

---

# 3. Color System

## Primary Brand

| Token         | Value     | Purpose                               |
| ------------- | --------- | ------------------------------------- |
| Primary       | `#6D3DF5` | Main actions and brand                |
| Primary Dark  | `#5728D9` | Pressed / active states               |
| Primary Light | `#EEE9FF` | Selected and subtle highlighted areas |
| White         | `#FFFFFF` | Main application canvas               |

Purple should be used deliberately rather than filling large portions of every screen.

---

## Neutral Colors

| Token                | Value     |
| -------------------- | --------- |
| Background           | `#FFFFFF` |
| Secondary Background | `#F7F7F8` |
| Border               | `#E5E5EA` |
| Foreground           | `#18181B` |
| Secondary Text       | `#71717A` |
| Muted Text           | `#A1A1AA` |

---

## Semantic Colors

| State   | Color     |
| ------- | --------- |
| Success | `#16A34A` |
| Warning | `#F59E0B` |
| Error   | `#DC2626` |
| Info    | `#2563EB` |

Semantic colors should retain their meaning and should not be replaced with brand purple.

---

# 4. shadcn Theme Direction

The shadcn theme should approximately follow:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 10%;

  --primary: 258 90% 60%;
  --primary-foreground: 0 0% 100%;

  --secondary: 255 100% 96%;
  --secondary-foreground: 258 75% 48%;

  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;

  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 258 90% 60%;

  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;

  --radius: 0.75rem;
}
```

These values are the initial foundation rather than immutable rules.

---

# 5. Spacing System

Use a lightweight **8px-based system**.

```text
4px   Micro
8px   Tight
12px  Small
16px  Standard
24px  Section
32px  Large
48px  Major
```

### Mobile Screen Padding

Default horizontal screen padding:

**16–20px**

Prefer whitespace over unnecessary dividers or containers.

---

# 6. Shape

Use moderately rounded elements.

| Token   | Radius |
| ------- | -----: |
| Small   |    8px |
| Default |   12px |
| Large   |   16px |
| Pill    |  999px |

Recommended usage:

- Inputs: `12px`
- Buttons: `12px`
- Cards: `16px`
- Badges: pill or `8px`

Avoid excessively rounded interfaces.

---

# 7. Core shadcn Components

RetainMaxx should primarily use:

| Product Need         | shadcn Component              |
| -------------------- | ----------------------------- |
| Main actions         | `Button`                      |
| Text input           | `Input`                       |
| Long input           | `Textarea`                    |
| Dropdown selection   | `Select`                      |
| Toggle               | `Switch`                      |
| Checkbox             | `Checkbox`                    |
| Radio selection      | `RadioGroup`                  |
| Tabs                 | `Tabs`                        |
| Content container    | `Card`                        |
| Status               | `Badge`                       |
| Modal                | `Dialog`                      |
| Confirmation         | `AlertDialog`                 |
| Mobile bottom sheet  | `Drawer`                      |
| Action menu          | `DropdownMenu`                |
| Contextual popup     | `Popover`                     |
| Dates                | `Calendar`                    |
| Notifications        | `Sonner`                      |
| Loading placeholders | `Skeleton`                    |
| Progress             | `Progress`                    |
| Form structure       | shadcn Form + React Hook Form |

---

# 8. Buttons

## Primary

Use for the main action on a screen.

```text
Background: Primary Purple
Text: White
Height: 48–52px
Radius: 12px
Font: 16px / Semibold
```

Examples:

- Continue
- Save
- Submit
- Confirm

Prefer one dominant primary action per screen.

---

## Secondary

Use when an action is important but not primary.

```text
Background: Primary Light
Text: Primary Purple
```

---

## Outline

Use for secondary actions where visual prominence should remain low.

```text
Background: White
Border: Neutral Border
Text: Foreground
```

---

## Ghost

Use primarily for:

- Toolbar actions
- Icon actions
- Navigation
- Low-emphasis controls

---

# 9. Inputs and Forms

Use shadcn inputs with consistent form structure.

Preferred structure:

```text
Label
[ Input                           ]
Helper text / error
```

Default:

```text
Height: 48–52px
Radius: 12px
Border: Neutral
Background: White
```

Focused:

```text
Ring: Primary Purple
```

### Rules

- Do not rely only on placeholder text for labels.
- Show validation close to the relevant field.
- Keep forms vertically structured.
- Avoid multiple columns on mobile.
- Break long forms into logical steps where appropriate.

---

# 10. Cards

Cards should be used only when grouping information adds clarity.

Recommended:

```text
Background: White
Border: 1px solid neutral border
Radius: 16px
Padding: 16px
Shadow: None or extremely subtle
```

Prefer:

**Whitespace → subtle background → border → shadow**

in that order.

Do not turn every section into a card.
