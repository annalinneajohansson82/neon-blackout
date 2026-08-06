# Neon Blackout

A cyberpunk/synthwave design system on a near-black void. High-contrast neon,
one spacing scale, one set of radii. Thirteen colours come from the
Intersex-Inclusive Progress Pride flag at the flag's own hex values; two
signature neons are ours.

**License:** CC0 — free to use in any project.

---

## The world

Night city. A terminal in a hacker's basement. An AI running on backup power
in a flooded server room. The security-cam green of a corporate firewall
being breached.

This is not a universe where neon decorates the streets — it *is* the only
light source. The void has swallowed everything else. Surfaces exist only to
be punctuated by light. Colour is emitted, not applied.

Neon Blackout lives in the dark side of the 80s future. Not the one that was
promised on postcards — the one that actually arrived.

## References, felt rather than listed

The design alludes to its influences rather than wearing them on its sleeve.
If you recognise them, you'll feel them in the spacing, the glow, the palette
decisions:

- **Tron** — grid protocols, digital battlegrounds, light as the only terrain
- **Blade Runner** — rain-slicked noir, perpetually dark cityscapes, neon reflected on wet pavement
- **Terminator** — cold metallic dread, post-judgment day ruin, machine vision
- **Videodrome** — analog corruption, cathode ray decay, the screen bleeding into the real
- **The Matrix** — simulated existence, green-tinted code, the space between programs
- **Total Recall** — corporate dystopia, unreliable reality, the line between implant and memory
- **A Scanner Darkly** — identity erosion, scanner paranoia, the self as interference pattern

None of these are stated in the UI. They inform the *weight* of a button
press, the *distance* between lines, the *temperature* of a glow.

## Emotional register

- Paranoid, urgent, alive in the dark
- The neon is a warning, not a decoration
- Every glow is a signal — breach, heartbeat, countdown
- The machine is watching. The machine is also dying.
- This is the terminal, not the beach

Emotional register is the spec. If a component feels like a Miami afternoon
instead of a terminal in a basement, it's wrong, regardless of token values.
The vibe is the lint check.

**Keywords:** void · breach · signal loss · flicker · backup power · dead
channels · encrypted · ghost in the machine · neon decay · cathode ray · grid
geometry · line noise

## Design philosophy

The references should be *felt*, not stated. A user should never read "Blade
Runner" in the interface — but they should feel like it just rained on a city
that never sleeps. This document is the only place the touchstones are made
explicit, and only so anyone picking up the project understands *why* the void
is `#050507` and not `#1a1a2e`.

---

## Sister system

[Neon Whiteout](https://github.com/annalinneajohansson82/neon-whiteout) is the
sister system. The relationship is creative, not technical: the two started
from the same idea, neon as a register, and went to opposite ends of it.

| Neon Blackout | Neon Whiteout |
|---|---|
| Night city | Beachfront at 4 PM |
| Terminal breach | Hot pink flamingo |
| Void background | Bleached paper |
| Tron / Blade Runner | Miami Vice / OutRun |
| Glow — emission | Halo — scatter |
| Paranoid 80s | Optimistic 80s |

That contrast is the whole of it. Neon Blackout is standalone: no shared token
contract, no interchangeable components, no obligation to match anything.
Nothing here is derived from the sister system and nothing here should be
justified by it. If a decision in this repo can only be explained by what
another repo does, the decision is unexplained.

---

## Using it

Drop the stylesheet and the fonts into your project:

```
neon-blackout.css
fonts/
```

```html
<link rel="stylesheet" href="neon-blackout.css">
```

The fonts are self-hosted and SIL Open Font Licensed. The stylesheet is the
deliverable — it loads its own faces, so you get the real identity rather than
a system fallback, with no CDN dependency and no GDPR exposure.

Open `preview.html` in a browser to see every colour and component in use.

## Files

| File | What |
|---|---|
| `README.md` | This. Identity, emotional register, sister-system relationship |
| `CONTEXT.md` | Design principles, palette provenance, colour status, glow membership |
| `tokens.json` | Canonical hex values, semantics, component specs, usage rules |
| `neon-blackout.css` | The stylesheet |
| `preview.html` | Every colour and component, in use |
| `fonts/` | Audiowide, Space Grotesk, Space Mono — subset, self-hosted |
| `tools/check-coherence.mjs` | Verifies the documents agree with what ships |
| `hermes/skins/neon-blackout.yaml` | Terminal skin, consumes the ANSI layer |

When two documents disagree, the higher one in that list wins and the lower one
is wrong. Run `node tools/check-coherence.mjs` to check the parts of that a
machine can settle.
