import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createShadcnKit } from '../dist/index.js';

const primitive = (tag) => ({ children, ...props }) => createElement(tag, props, children);
const inputs = {
    Input: primitive('input'), Label: primitive('label'),
    Card: primitive('section'), CardContent: primitive('div'),
    Textarea: primitive('textarea'), Button: primitive('button'),
    Checkbox: ({ checked, onCheckedChange, ...props }) => createElement('input', { ...props, type: 'checkbox', checked }),
};

const tablePrimitives = {
    Table: primitive('table'),
    TableHeader: primitive('thead'),
    TableBody: primitive('tbody'),
    TableRow: primitive('tr'),
    TableHead: primitive('th'),
    TableCell: primitive('td'),
    Badge: primitive('span'),
};

const dataTable = (mode, pagination = undefined) => ({
    type: 'table',
    key: 'root/members',
    props: {
        name: 'members', label: 'Members', searchable: true, mode,
        rows: [{ id: 1, name: 'Lina', status: 'active' }, { id: 2, name: 'Maya', status: 'paused' }],
        pagination,
    },
    components: [
        { type: 'text-column', key: 'root/name', props: { name: 'name', label: 'Name', sortable: true, searchable: true, toggleable: true }, components: [] },
        { type: 'text-column', key: 'root/status', props: { name: 'status', label: 'Status', badge: true, badgeTones: { active: 'success', paused: 'warning' }, toggleable: true }, components: [] },
    ],
});

test('without host Table primitives, default Lavertia table is preserved', () => {
    const kit = createShadcnKit(inputs);
    assert.equal(kit.components.table, undefined);
});

test('Shadcn Table renders real table primitives with data, sorting, statuses and column manager', () => {
    const kit = createShadcnKit({ ...inputs, ...tablePrimitives });
    const html = renderToStaticMarkup(createElement(kit.components.table, {
        node: dataTable('snapshot'), children: null,
    }));
    assert.match(html, /<table/);
    assert.match(html, /aria-sort="none"/);
    assert.match(html, /Lina/);
    assert.match(html, /Maya/);
    assert.match(html, /Status/);
    assert.doesNotMatch(html, /name=""/);
    assert.match(html, /Members/);
});

test('Table Eloquent pagination retains backend page/total without client-side slicing', () => {
    const kit = createShadcnKit({ ...inputs, ...tablePrimitives });
    const html = renderToStaticMarkup(createElement(kit.components.table, {
        node: dataTable('eloquent', { page: 2, lastPage: 7, total: 80, nextUrl: '/members?page=3', previousUrl: '/members?page=1' }),
        children: null,
    }));
    assert.match(html, /Lina/);
    assert.match(html, /Maya/);
    assert.match(html, /href="\/members\?page=3"/);
    assert.match(html, /Page 2 of 7/);
    assert.match(html, /80/);
});

test('Shadcn Table refuses unsafe pagination URLs', () => {
    const kit = createShadcnKit({ ...inputs, ...tablePrimitives });
    const html = renderToStaticMarkup(createElement(kit.components.table, {
        node: dataTable('eloquent', { page: 1, lastPage: 2, nextUrl: 'javascript:alert(1)' }),
        children: null,
    }));
    assert.doesNotMatch(html, /href="javascript:/);
});
