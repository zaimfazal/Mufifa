# Dependency Audit Report

## 1. Outdated Packages
The following packages have newer versions available. Minor/patch updates are safe to apply, but major version bumps (e.g., `eslint` 9 to 10, `typescript` 5 to 6) require careful regression testing.

| Package | Current Version | Wanted Version | Latest Version | Type |
|---|---|---|---|---|
| `@base-ui/react` | `1.5.0` | `1.6.0` | `1.6.0` | Dependency |
| `@types/node` | `20.19.43` | `20.19.43` | `26.0.0` | Dev Dependency |
| `eslint` | `9.39.4` | `9.39.4` | `10.5.0` | Dev Dependency |
| `papaparse` | `5.5.3` | `5.5.4` | `5.5.4` | Dependency |
| `react` | `19.2.4` | `19.2.4` | `19.2.7` | Dependency |
| `react-dom` | `19.2.4` | `19.2.4` | `19.2.7` | Dependency |
| `react-hook-form` | `7.79.0` | `7.80.0` | `7.80.0` | Dependency |
| `typescript` | `5.9.3` | `5.9.3` | `6.0.3` | Dev Dependency |

**Recommendation:** Run `npm update` to bump non-breaking minor and patch versions (like `react`, `react-dom`, `papaparse`). Delay major updates for `eslint` and `typescript` until post-launch to maintain stability.

---

## 2. Vulnerable Packages
An `npm audit` scan revealed **2 moderate severity vulnerabilities**.

* **Vulnerability:** PostCSS has XSS via Unescaped `</style>` in its CSS Stringify Output.
* **Severity:** Moderate
* **Affected Package:** `postcss <8.5.10`
* **Dependency Path:** `next > postcss`
* **Root Cause:** Next.js `16.2.9` relies on a vulnerable sub-dependency of `postcss`. 

**Recommendation:** Since this vulnerability is nested deeply within Next.js's internal dependencies, running `npm audit fix --force` will force a breaking change by downgrading/upgrading Next.js unpredictably. Instead, use `overrides` in `package.json` to force resolution of `postcss` to `>=8.5.10`, or wait for the Next.js maintainers to release a patch for `16.x`.

---

## 3. Abandoned / Deprecated Packages
A manual review of `package.json` was conducted to identify packages that are unmaintained, deprecated, or abandoned by their authors.

* **Findings:** No abandoned packages were detected. The repository uses modern, highly-maintained ecosystems:
  * Forms: `react-hook-form` + `zod`
  * State/Data: `@tanstack/react-table`
  * Database/Auth: `@supabase/supabase-js` + `@supabase/ssr`
  * UI: `shadcn`, `lucide-react`, `tailwindcss`
  * Parsing: `papaparse`

**Recommendation:** The dependency stack is extremely healthy. Continue monitoring for deprecation notices during routine `npm install` cycles.
