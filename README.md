# Shadowrun 6 Eden — Focused Concentration (Foundry VTT)

Automates the **Focused Concentration** quality (SR6 Core, p. 71) for the **Shadowrun 6 Eden** system. https://github.com/yjeroen/foundry-shadowrun6-eden

For each level, the character can sustain one more spell or complex form without the -2 dice pool penalty for sustaining. At level 1, sustaining two spells gives -2 instead of -4.

## Installation

Paste the link below into **Add-on Modules → Install Module → Manifest URL**:

```
https://github.com/zychuk/foundry-shadowrun6-eden-focused-concentration/releases/latest/download/module.json
```

## Usage

- Enable the module in **Manage Modules**.
- Give the quality an Active Effect with key `system.focusedConcentration`, mode **Add**, and the level as the value.
- Toggle spells to "sustaining" on the character sheet as usual. Roll dialogs show the reduced penalty automatically.

## Notes

- Spells with a Drain Value of 7 or more don't count towards the free sustained spells, as the rule requires.
