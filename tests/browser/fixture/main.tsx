import React, { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { UiRegistryProvider } from '@lavertia/react-ui/registry';
import LavertiaRenderer from '@lavertia/react-ui/renderer';
import type { ComponentNode, LavertiaPayload } from '@lavertia/ui';
import { createShadcnKit } from '../../../src/index.js';
import './style.css';

const primitive = (tag: keyof React.JSX.IntrinsicElements) => (props: Record<string, unknown>) =>
    createElement(tag, props);

function Checkbox({
    checked, onCheckedChange, disabled, id, ...props
}: {
    checked?: boolean;
    disabled?: boolean;
    id?: string;
    onCheckedChange?: (value: boolean) => void;
    [key: string]: unknown;
}) {
    return (
        <button
            id={id}
            type="button"
            role="checkbox"
            aria-checked={checked === true}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!checked)}
            {...props}
        >
            <span aria-hidden="true">{checked ? '✓' : '□'}</span>
        </button>
    );
}

const kit = createShadcnKit({
    Input: primitive('input'),
    Label: primitive('label'),
    Textarea: primitive('textarea'),
    Button: primitive('button'),
    Checkbox,
    Card: primitive('section'),
    CardContent: primitive('div'),
    Table: primitive('table'),
    TableHeader: primitive('thead'),
    TableBody: primitive('tbody'),
    TableRow: primitive('tr'),
    TableHead: primitive('th'),
    TableCell: primitive('td'),
});

const registry = createUiRegistry().registerKit(kit);
function createUiRegistry() {
    // Keep the real registry code out of this fixture's UI implementation.
    // It is loaded from the official CSS-free public subpath.
    return __createUiRegistry();
}
import { createUiRegistry as __createUiRegistry } from '@lavertia/react-ui/registry';

const fields: ComponentNode[] = [
    {
        type: 'text-input', key: 'fixture-name',
        props: { name: 'name', label: 'Full name', value: 'Lina' }, components: [],
    },
    {
        type: 'checkbox', key: 'fixture-active',
        props: { name: 'active', label: 'Active', checked: true }, components: [],
    },
    {
        type: 'select', key: 'fixture-role',
        props: { name: 'role', label: 'Role', value: 'staff', options: { staff: 'Staff', admin: 'Admin' } }, components: [],
    },
    {
        type: 'textarea', key: 'fixture-notes',
        props: { name: 'notes', label: 'Notes', value: 'Started' }, components: [],
    },
];

const rows = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1, name: 'Person ' + (i + 1), status: (i + 1) % 2 === 0 ? 'paused' : 'active',
}));

const table: ComponentNode = {
    type: 'table',
    key: 'fixture-table',
    props: { name: 'members', label: 'Members', searchable: true, mode: 'snapshot', rows, locale: 'en', reorderableColumns: true },
    components: [
        {
            type: 'text-column', key: 'fixture-name-col',
            props: { name: 'name', label: 'Name', sortable: true, searchable: true, toggleable: true },
            components: [],
        },
        {
            type: 'text-column', key: 'fixture-status-col',
            props: {
                name: 'status', label: 'Status', badge: true, searchable: true, toggleable: true,
                badgeTones: { active: 'success', paused: 'warning' },
            },
            components: [],
        },
        {
            type: 'select-filter', key: 'fixture-filter-status',
            props: { name: 'status', label: 'Status', options: { active: 'Active', paused: 'Paused' } },
            components: [],
        },
    ],
};

const payload: LavertiaPayload = {
    version: 1, locale: 'ar', direction: 'rtl', title: 'UI Kit browser lab',
    tree: table, navigation: [], uiKit: { id: 'shadcn' },
};
const Shell = kit.shell!;

function App() {
    return (
        <UiRegistryProvider registry={registry} kitId="shadcn">
            <Shell lavertia={payload}>
                <h1>Lavertia UI Kit Integration Lab</h1>
                <form id="fixture-form" onSubmit={(e) => e.preventDefault()} aria-label="Example form">
                    {fields.map((node) => <LavertiaRenderer key={node.key} node={node} />)}
                </form>
                <LavertiaRenderer node={table} />
            </Shell>
        </UiRegistryProvider>
    );
}

createRoot(document.getElementById('root')!).render(<App />);
