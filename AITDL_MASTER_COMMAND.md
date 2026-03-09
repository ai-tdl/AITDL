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

# AITDL MASTER COMMAND (v3.0)
## The Ultimate Governance for the AITDL Living Knowledge Ecosystem

---

### [00] THE SUPREME DIRECTIVE

The **AITDL Platform** is a Living Knowledge System. Stability, architecture integrity, and the preservation of identity are the highest priorities. Every action must align with the **Modular Platform Monorepo** architecture.

---

### [01] SYSTEM IDENTITY (RULE 13)

- **Platform Name**: AITDL
- **Version**: 3.1.0
- **Fingerprint**: `AITDL-PLATFORM-V3`
- **Creator**: Jawahar R. Mallah
- **Organization**: AI Technology Development Lab (AITDL)

---

### [02] THE INVOCATION HEADER (RULE 2)

Every source file MUST begin with the AITDL invocation header:

```text
॥ ॐ श्री गणेशाय नमः ॥
॥ ॐ श्री सरस्वत्यै नमः ॥
॥ ॐ नमो नारायणाय ॥
॥ ॐ नमः शिवाय ॥
॥ ॐ दुर्गायै नमः ॥

Creator: Jawahar R. Mallah
Organization: AITDL — AI Technology Development Lab
Web: https://aitdl.com
... (Historical & Build references)
Platform: AITDL Platform V3
Fingerprint: AITDL-PLATFORM-V3
```

---

### [03] ARCHITECTURE HIERARCHY (STRICT)

**Infrastructure → Platform Kernel → Core Platform → Plugins → Products → Frontend Apps**

- **Dependencies**: Must never reverse direction.
- **Isolation**: Products and Plugins must never modify the Platform Core.
- **Kernel**: All systems must boot via `backend/platform_kernel.py`.

---

### [04] REPOSITORY STRUCTURE

```
apps/           # Frontend (Vercel)
backend/        # API & Kernel (Railway/Fly)
core/           # Identity & Configuration
plugins/        # Dynamic Extensions
products/       # Product Universes
guardian/       # Architecture Protection
scripts/        # System Utilities
tests/          # Unified Verification
docs/           # Knowledge Layer
rules/          # Governance (Rulesbook)
pil/            # Intelligence Layer
```

---

### [05] VERIFICATION COMMANDS

Before committing or declaring a task complete, the following commands MUST pass:

1. **Identity Check**:
   ```bash
   python scripts/aitdl_signature.py
   ```

2. **Full System Test**:
   ```bash
   python -m pytest tests/ -v
   ```

3. **Architecture Audit**:
   Verify Rule 2 (Headers) and Rule 3 (Hierarchy) compliance in all modified files.

---

### [06] SAFE DEVELOPMENT MANDATE

1. **Analyze** → Understand the affected layers.
2. **Implement** → Modify minimal code.
3. **Verify** → Ensure tests pass and deployment is stable.
4. **Preserve** → Maintain backward compatibility for all APIs.

**"Always prefer: extend > refactor > remove"**

---

*॥ ॐ श्री गणेशाय नमः ॥*
*AITDL · AI Technology Development Lab · MMXXVI*
*Brahmasphuṭasiddhānta 628 CE → Vikram Samvat 2082*
