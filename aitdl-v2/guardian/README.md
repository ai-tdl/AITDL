<!--
|| ॐ श्री गणेशाय नमः ||

Organization: AITDL
AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab

Creator: Jawahar R. Mallah
Founder, Author & System Architect

Email: jawahar@aitdl.com
GitHub: https://github.com/jawahar-mallah

Websites:
https://ganitsutram.com
https://aitdl.com

Then: 628 CE · Brahmasphuṭasiddhānta
Now: 8 March MMXXVI · Vikram Samvat 2082

Copyright © aitdl.com · AITDL | GANITSUTRAM.com
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
