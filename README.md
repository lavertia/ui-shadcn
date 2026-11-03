# Lavertia Shadcn UI Kit

**Official React UI Kit adapter for [Lavertia](https://github.com/lavertia/panels)** — the application's shadcn components render PHP-authored Lavertia pages. UI Kit swapping never changes the PHP Component Protocol.

**Status: P1 developer preview, not yet published on npm.** This is now the canonical source repository for `@lavertia/ui-shadcn`, migrated from the prototype at `lavertia/react-ui/packages/ui-shadcn`.

## Architecture

- `lavertia/ui`: shared serializable component protocol and theme tokens
- `lavertia/react-ui`: React component registry, layout/shell contract, reusable Inertia form state and fallback renderers
- **`lavertia/ui-shadcn` (this repository):** shadcn presentation of Page Shell, Card, Page Header, Forms, TextInput, Textarea, Checkbox, Select, Action links and Table (when host provides shadcn Table primitives)
- **Host Laravel app:** owns actual shadcn open-code primitives (Radix/Base UI), CSS variables, theme styles, routing and authorization

This package does **not** bundle shadcn vendor sources, fork the React renderer, or depend on the Laravel Panel. Table rendering uses the host's native shadcn primitives if provided. Otherwise the tested default React UI Table remains the fallback. The core still supports Vue and Svelte independently.

## Install (React preview)

Use a Laravel React Starter Kit with Lavertia installed, and existing `@/components/ui` aliases.

```bash
# Install from GitHub until tagged npm releases exist; commit hashes are frozen in package-lock.json.
npm install github:lavertia/ui#main github:lavertia/react-ui#main github:lavertia/ui-shadcn#main

# Only if the host does not already contain these shadcn primitives:
npx shadcn@latest init
npx shadcn@latest add card input label textarea checkbox button table

php artisan lavertia:install --stack=react --ui=shadcn
npm run build
```

**Do not run `shadcn init` over an already configured Starter Kit unless you intend to replace its configuration.** The installation command never downloads JavaScript on your behalf. Read the [installer guide](https://github.com/lavertia/panels/blob/main/docs/SHADCN_INSTALL.md).

If you prefer manual registration, render the kit from the host's Page shim:

```tsx
import { LavertiaPage, createUiRegistry } from '@lavertia/react-ui';
import { createShadcnKit } from '@lavertia/ui-shadcn';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { LavertiaPayload } from '@lavertia/ui';

const registry = createUiRegistry().registerKit(createShadcnKit({
    Input, Label, Textarea, Checkbox, Button, Card, CardContent,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
}));

export default function Page({ lavertia }: { lavertia: LavertiaPayload }) {
    return <LavertiaPage lavertia={lavertia} registry={registry} />;
}
```

Configure `'ui' => ['kit' => 'shadcn', 'theme' => null]` in `config/lavertia.php`.

## Select compatibility

`SelectControl` is an optional **host-owned** adapter for shadcn's compound Base UI or Radix Select. It receives `id`, `value`, `options`, `required`, `disabled` and `onValueChange`. Without one, the kit renders an accessible native select. A single hidden input provides form submission for compound controls; do not duplicate named inputs in the adapter.

Optional `buttonClassName: variant => buttonVariants({ variant })` maps local Inertia actions to the host's shadcn button styles.

## Behavior and security

- `useFormSubmission` is imported from the CSS-free `@lavertia/react-ui/form-submission` entry; Laravel controls validation and policies.
- Actions sanitize link destinations using the common `safeHref` contract; external links use `rel="noopener noreferrer"`.
- RTL/locale come from the server-rendered Lavertia payload, not a late browser flip.
- UI Kit and Theme are separate concepts. Changing the Kit does not change PHP component definitions.
- This package is not fully featured: Dialog, advanced table options, advanced fields and browser/a11y visual QA remain milestones.

## Development

```bash
npm install
npm run typecheck
npm test
npm pack --dry-run
```

GitHub Actions validates TypeScript, SSR component tests and package output on PRs. See [the founder-approved roadmap](https://github.com/lavertia/panels/blob/main/docs/FEATURE_ROADMAP.md) and [UI Kit extraction issue](https://github.com/lavertia/panels/issues/47).

License: MIT.

## Table contract

A host that provides all six `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead` and `TableCell` shadcn primitives enables the native Table renderer automatically. You may also supply `Badge`; otherwise it renders a styled `span`.

The Table uses `@lavertia/react-ui/table-state` for shared filtering, sorting, column visibility/reordering, and pagination. **Eloquent mode always delegates filtering and paging to Laravel**, never materializes an entire query in React. The optional column manager and snapshot pagination retain the existing PHP protocol and generated output. The table adapter does not yet support advanced bulk selection/actions or a dedicated Dialog.

To add the native Table to an already configured React app:

```bash
npx shadcn@latest add table
```

Import the six host components into your `createShadcnKit` call. This is intentionally optional so existing users can upgrade the package without adding new UI primitives immediately.

## Browser interaction QA

The UI Kit includes a Vite-powered React fixture (not a production Laravel app) to test host-owned field/table primitive contracts in real Chromium, across desktop and mobile viewports:

```bash
npm install
npx playwright install chromium
npm run test:browser
```

Tests exercise first-render `dir=rtl`, keyboard/touch form values and FormData, snapshot Table searching, sorting, column visibility, filters and pagination. CI captures failure traces/screenshots. **This is contract/UI interaction coverage, not full Laravel route/CSRF/tenancy E2E or a visual audit of stock shadcn primitives.**
