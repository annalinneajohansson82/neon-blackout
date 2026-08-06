# Neon Blackout — Design Philosophy

Neon Blackout is a cyberpunk/synthwave design system built on a near-black
void, where neon is the only light source. This document is authoritative for
design principles, palette provenance and colour status.

**Status, 2026-08-06.** This document records the decisions of a grilling
pass. The implementation artifacts have not yet been rewritten to match, so
ranks 3 and 4 currently contradict this document on most of what follows, and
some files named here do not exist yet. That is the work this pass authorises,
not a description of what ships today.

Nothing in this repository makes claims about the contents of another
repository. Neon Blackout is described entirely by what ships here. A
decision that can only be explained by what another repository does is a
decision that has not been explained.

## Source of truth

Identity comes first. Technical artifacts derive from it, never the reverse.

| Rank | Document | Authoritative for |
|---|---|---|
| 1 | `README.md` | Identity, emotional register, sister-system relationship |
| 2 | `CONTEXT.md` | Design principles, palette provenance, colour status, glow membership |
| 3 | `tokens.json` | Canonical hex values, semantics, component specs, usage rules |
| 4 | `neon-blackout.css`, `component-spec.html` | Implementation and demonstration |

When two documents disagree, the higher-ranked one wins and the lower one is
wrong. `node tools/check-coherence.mjs` enforces the parts of this that can be
computed: a hex stated here must be the hex that ships, every stated contrast
ratio is recomputed, glow colours must derive from their tokens, and the mono
floor must hold. It does not enforce taste.

A ranking without a checker is an intention. Every contradiction found during
this pass was mechanically detectable, and the radius, glow-API and font
defects all shipped in the initial commit.

`README.md` is the identity brief, not documentation. The palette, spacing,
radius and glow tables it used to carry belong at ranks 2 and 3, and
`docs/identity.md` merges into it rather than competing with it for rank 1.

`tokens.json` is rewritten rather than corrected. Both of the files it
replaces described a system that no longer exists, and one of them claimed to
be canonical while contradicting the CSS and the spec page on every radius
value. A file that is wrong about what it governs is not repaired by editing
the wrong values.

## Principles

### 1. Emotional register is the spec

Night city, not beachfront. Paranoid 80s, not optimistic 80s. If a component
feels like a Miami afternoon instead of a terminal in a basement, it's wrong,
regardless of token values. The vibe is the lint check.

Colour is emitted, never applied. Surfaces exist to be punctuated by light.

### 2. The palette has two tiers

Thirteen colours are taken from the Intersex-Inclusive Progress Pride flag at
their exact hex values. The signature neons are ours. The distinction is
load-bearing. The heritage colours carry meaning that came with them, so we
keep them at their flag values and treat any change as a change to the
meaning. The signature neons are design decisions we own, so we revise them
freely.

Heritage membership is a test, not a preference: a colour is heritage if it
appears on the flag, at the flag's own hex. A heritage colour altered is a
colour that no longer refers to the thing it is named for.

#### Heritage (13, flag-derived)

Every colour of the flag ships as a token, at the flag's own hex.

| Token | Hex | Flag colour | Represents |
|---|---|---|---|
| `--autonomy-yellow` | `#ffd800` | Intersex Yellow | Free of the binary |
| `--wholeness-violet` | `#c20ff0` | Intersex Purple | Wholeness, autonomy |
| `--becoming-white` | `#ffffff` | White | Trans, nonbinary |
| `--trans-pink` | `#ff8fd8` | Trans Pink | Trans community |
| `--trans-blue` | `#5ad4ec` | Trans Blue | Trans community |
| `--kinship-brown` | `#c98745` | Brown | People of colour |
| `--remembrance-black` | `#12131c` | Black | POC, lives lost to AIDS |
| `--lifeblood-red` | `#ff3864` | Life | Red stripe |
| `--mending-orange` | `#ff9f1c` | Healing | Orange stripe |
| `--sunlight-yellow` | `#fcee09` | Sunlight | Yellow stripe |
| `--pulse-green` | `#39ff14` | Nature | Green stripe |
| `--harmony-blue` | `#00aaff` | Harmony | Blue stripe |
| `--spirit-violet` | `#7b3fd4` | Spirit | Violet stripe |

#### Signature neons (ours)

These carry flag-style names but are not flag colours. No magenta exists in
the Progress Pride flag, and the flag's Trans Blue is `#5ad4ec`, not our
turquoise. They are invented, and naming them as heritage would misrepresent
the flag.

| Token | Hex | Role |
|---|---|---|
| `--resistance-magenta` | `#ff00aa` | Brand identity, primary action |
| `--transition-cyan` | `#00fff0` | Focus, cursor, active indicator |

There are two signature neons and no secondary siblings. Neon Whiteout has
four, because on paper a softer neon means mixing toward white, and nothing
else in that system occupies the space between a pastel tint and the full
colour. On the void, softer means mixing toward the void, and the `-bg` tints
already do exactly that at 12–15%. The tier NW had to invent, NB already had,
built in the opposite direction.

The identity argues the same way. The neon is a warning, not a decoration, so
a deliberately quieter brand colour would be working against the register.

### 3. Surfaces are named for what they are, not what they do

`--elev` is retired. It named a role ("elevated") that the system had already
stopped honouring: panels render on the void, and the token survived in two
incidental places. Its hex is the remembrance stripe, so the colour keeps the
heritage name and components reference `--remembrance-black` directly.

One name per colour. A surface that needs a role name needs a reason first.

`--raised` is renamed `--shimmer`. It was documented as "transient UI only
(modals, dropdowns, popovers, toasts)" and forbidden on permanent surfaces,
but no transient component exists in the system and its only real use is the
midpoint of the skeleton shimmer gradient. A rule that governs nothing is not
a rule. The value stays because the shimmer needs it; the reservation goes.

If modals and toasts are built later, a transient surface has to earn its
place then. Tokens are not reserved in advance for components that may never
arrive.

The surfaces, in full:

| Token | Hex | What it is |
|---|---|---|
| `--void` | `#050507` | The dark everything sits in |
| `--remembrance-black` | `#12131c` | Raised surface. Heritage, see above |
| `--shimmer` | `#1a1a2e` | Skeleton shimmer highlight only |

### 4. Sunlight is the yellow of this system

`--sunlight-yellow` `#fcee09` carries the warning role and every other yellow
job in NB. It was chosen for register: on the void it reads as neon, and neon
is the whole premise. `--autonomy-yellow` `#ffd800` is the warmer, amber side
of yellow, and amber is a dashboard light rather than a sign in a night city.

Measurement agrees with the register argument. Yellow sits between
`--mending-orange` (staged) and `--pulse-green` (success), and those are the
two states a warning must never be mistaken for at a glance in a log stream:

| | to orange 34.6° | to green 110.6° |
|---|---|---|
| Sunlight `#fcee09`, 56.5° | 22.6° | 54.1° |
| Autonomy `#ffd800`, 50.8° | 16.9° | 59.8° |

Sunlight is the more evenly spaced of the two. Contrast plays no part in the
decision: both clear AAA on the void by more than three times.

On the void, yellow is legible enough to carry a role outright. Systems built
on light surfaces have to solve that problem some other way; this one does
not have it.

`--autonomy-yellow` ships as a heritage token and is referenced by nothing.
That is the same treatment NW gives `--sunlight-yellow`, so the two systems
mirror each other: each carries the whole flag, each puts a different yellow
to work. A heritage colour does not need a job to deserve its place. It needs
to be on the flag.

## Glow membership

The glow is how this system renders neon: emission in darkness. Eight colours
carry it, each one a palette token rather than a repeated literal:

`magenta`, `cyan`, `red`, `yellow`, `green`, `orange`, `blue`, `violet`.

Glow colours are derived, never authored. Each `.glow-{color}` resolves to a
`color-mix()` of its token, so a palette change propagates and drift is not
possible. The eight were hardcoded rgba literals until this pass, and the
Sunlight decision had already silently pointed `.glow-yellow` at a colour with
no role. Eight literals is eight opportunities for that, and the stylesheet
cannot report it.

Measured contrast of each glow colour against `--void`:

| Glow | Token | Contrast vs void |
|---|---|---|
| yellow | `--sunlight-yellow` `#fcee09` | 16.85:1 |
| cyan | `--transition-cyan` `#00fff0` | 16.06:1 |
| green | `--pulse-green` `#39ff14` | 15.02:1 |
| orange | `--mending-orange` `#ff9f1c` | 9.92:1 |
| blue | `--harmony-blue` `#00aaff` | 7.95:1 |
| red | `--lifeblood-red` `#ff3864` | 5.82:1 |
| magenta | `--resistance-magenta` `#ff00aa` | 5.66:1 |
| violet | `--spirit-violet` `#7b3fd4` | 3.40:1 |

**The spread is five-fold, and the strength scale does not account for it.** A
system built on paper has the opposite problem, where the high-luminance end
scatters too weakly to register. Here those same colours emit hardest.

The four strengths are nonetheless uniform across all eight colours. A
per-colour ceiling was designed, built and rejected during this pass, and the
reason is worth keeping.

Perceived intensity is almost entirely the core. A solid `#00fff0` bar
measures 0.79 relative luminance against a void at 0.0016 — roughly five
hundred times brighter — while the bloom is a wide gradient whose effective
alpha at any pixel is a fraction of its nominal value, spread thin over
near-black. Capping the bloom is therefore invisible: two separately
constructed comparisons showed no difference a person could see. Capping the
core is visible, and it removes precisely the punch that makes the system read
as neon rather than as tinted shadow. The two goals are in direct conflict,
and the version that preserved punch had moved the ceiling to the one place it
could have no effect.

**Discomfort is controlled by the user, not guessed at per colour.**
`prefers-contrast: less` lowers glow alpha and shrinks the top strength, and
`--glow-enabled: 0` disables the system outright. Both respond to a setting
the person has already expressed, which is the right shape for this kind of
control. The guidance to use the top strength on at most one element per view
stays as advice about composition.

The exact alphas and spreads live in `tokens.json`.

## Typography

Three faces, all SIL Open Font License, all self-hosted under `fonts/`.

| Role | Face |
|---|---|
| Display | Audiowide |
| Body | Space Grotesk Variable |
| Mono | Space Mono |

**Self-hosted, not CDN.** The stylesheet is the deliverable. Anyone who drops
`neon-blackout.css` plus `fonts/` into a project gets the real identity rather
than a system fallback. It also removes the Google Fonts GDPR exposure for EU
consumers and a render-blocking `@import`.

Before this pass the system failed that test twice over: `neon-blackout.css`
declared the font families and never loaded them, and `component-spec.html`
pointed its `@font-face` rules at a path that resolved nowhere, inside a
gitignored directory. The spec page had been rendering in fallback fonts, with
no reference to notice it against.

**Type is tokenized.** Sizes were five hardcoded literals, three of them
within 0.6px of each other, each decided separately. Spacing and radius were
already under a scale; type was the one part of the system with no shared
vocabulary, and that is precisely where the near-duplicates appeared. A
modular scale on a 16px base replaces them.

**Mono has its own floor: 0.875rem.** Space Mono carries a small x-height for
its size, and the system's densest text is mono. The smallest step on the
scale is available to body and labels; mono does not use it. The old rule said
0.8rem and every mono component in the system sat below it, which is the
signature of a minimum written as advice rather than expressed as a token.

### 5. What ships is what is documented, in both directions

`tokens.json` documents every component the stylesheet ships, under the class
names the stylesheet actually uses. Before this pass it described five
components while twelve shipped, and two of the five were named for classes
that do not exist: a consumer reading the token file would write `.button`
and get an unstyled element, with nothing to report the mistake.

This is the same failure as `--raised`, running the other way. There a token
was reserved for components that never arrived; here components arrived that
the token file never learned about. Neither direction is visible without
something checking, so the checker verifies both: no documented component
absent from the CSS, no shipped component absent from the docs.

## Material vocabulary

All other design decisions (surface values, spacing, border radius, glow
spread, component styling) are implementation choices that serve the
principles above. They carry no independent authority.

## Deferred

A `DESIGN.md` and an `AGENTS.md` are not part of this pass. Neither is needed
for the ranking to hold or the checker to run, and a system documents its
architecture better once the artifacts have stopped moving.
- Whether NB gains secondary signature siblings, as NW has.
- Document ranking and what enforces it.
- Which of the two token files survives.
