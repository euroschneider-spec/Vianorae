# Design system

The visual identity is a working design, independent of any existing project. The wordmark uses three simple arches; it makes no registered-trademark claim. Museum illustrations are original SVG examples.

| Token | Light value | Purpose |
| --- | --- | --- |
| `--bg` | `#fbf9f5` | Calm page background |
| `--surface` | `#fffefa` | Cards and panels |
| `--ink` | `#263932` | Main text |
| `--muted` | `#56665e` | Secondary text |
| `--green` | `#314e42` | Primary actions |
| `--accent` | `#9f5339` | Highlights and decorative markers |
| `--line` | `#dddcd2` | Boundaries |
| `--focus` | `#1368bd` | Keyboard focus |

Serif headings use Georgia; UI and body use system Arial/Helvetica. Local system fonts avoid external font calls. Fluid headings, short paragraphs and generous line heights support reflow. Default interactive controls target 44–50px height; focus uses a 3px outline with offset.

Reusable patterns include primary/outline buttons, quiet links, informational notices, provenance labels, sensory items, cards, labelled form fields, progress, disclosures and workspace navigation. Reading settings swap CSS tokens for dark/high-contrast modes and adjust root font size and spacing.

Public visit steps use one zone per screen, an image without overlaid text, short description, textual sensory bands, useful note and explicit next action. Low, moderate, high, variable and unknown are distinct labels; colour is supplementary. The public guide is deliberately simpler than the marketing page.

Future components must retain semantic landmarks, meaningful labels, keyboard operation, visible focus, non-colour labels, touch spacing and reduced-motion support. New photo assets require contextual alternative text and rights. Automated checks are a foundation check; user and manual assistive-technology testing remain necessary.
