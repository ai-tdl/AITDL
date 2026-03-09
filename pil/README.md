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

# PIL — Project Intelligence Layer

The PIL provides structured knowledge about the AITDL v2 codebase.
Every agent reads PIL files **before** writing any code (Rule 7).

## Files

| File | Purpose |
|---|---|
| [`project_map.json`](./project_map.json) | Full directory + module map |
| [`module_index.json`](./module_index.json) | Module → file cross-reference |
| [`dependency_map.json`](./dependency_map.json) | Module dependency graph |

## Rule 7 (from RULESBOOK)

> Before implementing code, analyze:
> - `project_map.json`
> - `module_index.json`
> - `dependency_map.json`
>
> Use these to understand module relationships, dependency structure, and repository layout.

---

*PIL files are generated/updated as the project grows.*
