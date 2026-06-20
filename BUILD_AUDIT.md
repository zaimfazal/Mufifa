# Build Audit Report

## Command Executions

### 1. `npm install`
* **Status**: Completed successfully (Exit Code 0).
* **Time**: 11 seconds.
* **Warnings**: 
  * `npm warn ERESOLVE overriding peer dependency`
  * `vite@8.0.16` vs `peerOptional vite@"^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0"` from `@sentry/server-utils@10.59.0`
* **Errors**: None.

### 2. `npm run build`
* **Status**: Completed successfully (Exit Code 0).
* **Time**: Compiled successfully in 7.1s, TS checks passed in 8.2s, Static Generation took 1.7s.
* **Warnings**: None.
* **Errors**: None. Next.js correctly optimized and built 18/18 static pages.

### 3. `npm run lint`
* **Status**: Failed (Exit Code 1).
* **File**: `src/tests/scoring.test.ts`
* **Warnings**:
  * `calculateScorerScore`, `calculateStatsScore`, and `calculatePenaltyScore` are imported but never used.
* **Errors (12)**:
  * `Unexpected any. Specify a different type (@typescript-eslint/no-explicit-any)` on multiple lines (17, 18, 24, 25, 31, 32, 38, 39, 45, 46, 52, 53) where mock payload data is cast as `any`.

### 4. `npx tsc --noEmit`
* **Status**: Failed (Exit Code 1).
* **File**: `src/tests/scoring.test.ts`
* **Errors**:
  * `error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'ScoringRule'.` (Lines 6-12).

## Conclusion
The production build pipeline (`npm run build`) is resilient and succeeds completely since Next.js ignores the `src/tests/` directory during its internal compilation checks. 

However, strict adherence to `lint` and `tsc` for CI environments breaks because the `vitest` unit test file (`src/tests/scoring.test.ts`) currently uses `any` typings to bypass full Postgres table schema mocking, and includes extraneous `id` properties not mapped in `ScoringRule`. 

### Remediation Plan
To achieve absolute zero-error across all rigid CLI tools:
1. Update `src/tests/scoring.test.ts` to omit the `id` field in the mock rules.
2. Remove unused function imports.
3. Replace `as any` casts with properly structured `Partial<Prediction>` and `Partial<Actual>` types or suppress the `eslint` rule locally inside the test file.
