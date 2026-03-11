<!--
॥ ॐ श्री गणेशाय नमः ॥
॥ ॐ श्री सरस्वत्यै नमः ॥
॥ ॐ नमो नारायणाय ॥
॥ ॐ नमः शिवाय ॥
॥ ॐ दुर्गायै नमः ॥

Creator: Jawahar R. Mallah
Organization: AITDL — AI Technology Development Lab
Web: https://aitdl.com

Historical Reference:
628 CE · Brahmasphuṭasiddhānta

Current Build:
8 March MMXXVI
Vikram Samvat 2082

Platform: AITDL Platform V3
Fingerprint: AITDL-PLATFORM-V3
-->

# Guardian — Architecture Protection System

The Guardian system protects AITDL architecture integrity.

## Responsibility

- Validates all agent actions before execution
- Enforces the 15 RULESBOOK constraints
- Blocks unauthorized root directory creation
- Prevents modification of protected files
- Reports rule conflicts instead of silently breaking

## Rule 8 (from RULESBOOK)

> Agents must never:
> - create unauthorized folders
> - modify protected directories
> - delete core data
> - bypass repository structure
>
> If a rule conflict occurs: **STOP and report the issue.**

## Files (Phase 2+)

| File | Purpose |
|---|---|
| `guardian/rules.json` | Machine-readable rule set |
| `guardian/validator.py` | Pre-commit validation script |
| `guardian/report.md` | Last validation report |

---

*Guardian is Phase 2. Directory reserved.*
