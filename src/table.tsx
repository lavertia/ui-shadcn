import { Link } from '@inertiajs/react';
import { columnBadgeTone, safeHref } from '@lavertia/ui';
import { useTableState } from '@lavertia/react-ui/table-state';
import type { UiComponent, UiComponentProps } from '@lavertia/react-ui';
import type { ShadcnPrimitives } from './primitives.js';

const badgeToneClasses = {
    success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    danger: 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    info: 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    neutral: 'bg-muted text-muted-foreground',
} as const;

function safeInternalLink(value: unknown): string | null {
    const href = safeHref(value);
    return href?.startsWith('/') ? href : null;
}

/**
 * Render Lavertia Tables using the app's real shadcn Table primitives.
 * Both snapshot and server-owned Eloquent modes use the same UI state engine.
 * Missing primitives mean the default Lavertia Table renderer stays intact.
 */
export function createShadcnTable(primitives: ShadcnPrimitives): UiComponent | null {
    const {
        Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
        Card, CardContent, Button, Input, Checkbox, Badge, buttonClassName,
    } = primitives;

    if (!Table || !TableHeader || !TableBody || !TableRow || !TableHead || !TableCell) {
        return null;
    }

    // Captured non-null aliases remain narrowed inside the React component closure.
    const TablePrimitive = Table;
    const TableHeaderPrimitive = TableHeader;
    const TableBodyPrimitive = TableBody;
    const TableRowPrimitive = TableRow;
    const TableHeadPrimitive = TableHead;
    const TableCellPrimitive = TableCell;

    function ShadcnTable({ node }: UiComponentProps) {
        const state = useTableState(node);
        const {
            columns, filters, mode, tx, title, search, setSearch, selectedFilters,
            hidden, setHidden, order, visibleColumns, filtered, pageRows,
            currentPage, lastPage, pagination, sortKey, direction,
            setPage, navigate, sort, applyFilter, move, reset,
        } = state;
        const previousUrl = safeInternalLink(pagination?.previousUrl);
        const nextUrl = safeInternalLink(pagination?.nextUrl);
        const paginationLinkClasses = buttonClassName?.('outline')
            ?? 'border-border focus-visible:ring-ring inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none';
        const controlClasses = 'border-input bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none';

        return (
            <section aria-label={title} className="min-w-0">
                <Card className="min-w-0">
                    <CardContent className="grid gap-0 p-0">
                        <header className="border-border grid gap-4 border-b px-4 py-5 sm:px-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0 space-y-1">
                                    <h2 className="text-foreground text-base font-semibold">{title}</h2>
                                    {typeof node.props.description === 'string' && node.props.description.length > 0 && (
                                        <p className="text-muted-foreground text-sm">{node.props.description}</p>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {node.props.searchable === true && (
                                        <form
                                            role="search"
                                            onSubmit={(event) => {
                                                event.preventDefault();
                                                if (mode === 'eloquent') navigate({ search });
                                                else setPage(1);
                                            }}
                                            className="flex min-w-0 gap-2"
                                        >
                                            <Input
                                                type="search"
                                                value={search}
                                                onChange={(event) => {
                                                    setSearch(event.currentTarget.value);
                                                    if (mode === 'snapshot') setPage(1);
                                                }}
                                                placeholder={tx('search')}
                                                aria-label={tx('search')}
                                                className="min-w-0 w-40 sm:w-60"
                                            />
                                            {mode === 'eloquent' && <Button type="submit">{tx('search')}</Button>}
                                        </form>
                                    )}
                                    {node.props.columnManager !== false && (
                                        <details className="relative">
                                            <summary className={controlClasses + ' cursor-pointer list-none'}>{tx('columns')}</summary>
                                            <div className="border-border bg-popover text-popover-foreground absolute end-0 z-30 mt-2 grid w-64 gap-2 rounded-lg border p-3 shadow-lg">
                                                {columns.filter((column) => !column.hidden).map((column) => {
                                                    const checked = !hidden.includes(column.key);
                                                    const disabled = !column.toggleable || (checked && visibleColumns.length <= 1);
                                                    const id = node.key + '-column-' + column.key;
                                                    return (
                                                        <div key={column.key} className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={id}
                                                                checked={checked}
                                                                disabled={disabled}
                                                                onCheckedChange={(value) => setHidden((old) =>
                                                                    value === true ? old.filter((key) => key !== column.key)
                                                                        : old.includes(column.key) ? old : [...old, column.key],
                                                                )}
                                                            />
                                                            <label htmlFor={id} className="min-w-0 flex-1 truncate text-sm">{column.label}</label>
                                                            {node.props.reorderableColumns === true && (
                                                                <div className="flex gap-1">
                                                                    <Button type="button" aria-label={tx('moveLeft') + ': ' + column.label}
                                                                        className="h-7 w-7 p-1" disabled={order.indexOf(column.key) <= 0}
                                                                        onClick={() => move(column.key, -1)}>↑</Button>
                                                                    <Button type="button" aria-label={tx('moveRight') + ': ' + column.label}
                                                                        className="h-7 w-7 p-1" disabled={order.indexOf(column.key) >= order.length - 1}
                                                                        onClick={() => move(column.key, 1)}>↓</Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <Button type="button" onClick={reset} className="w-full">{tx('reset')}</Button>
                                            </div>
                                        </details>
                                    )}
                                </div>
                            </div>

                            {filters.length > 0 && (
                                <div className="flex flex-wrap items-end gap-2">
                                    {filters.map((filter) => (
                                        <label key={filter.key} className="text-muted-foreground grid gap-1 text-xs">
                                            {filter.label}
                                            <select
                                                value={selectedFilters[filter.key] ?? ''}
                                                onChange={(event) => applyFilter(filter.key, event.currentTarget.value)}
                                                className={controlClasses + ' min-w-32'}
                                            >
                                                <option value="">{tx('filters')}: {filter.label}</option>
                                                {Object.entries(filter.options).map(([value, label]) =>
                                                    <option key={value} value={value}>{label}</option>)}
                                            </select>
                                        </label>
                                    ))}
                                    <Button type="button" onClick={reset}>{tx('reset')}</Button>
                                </div>
                            )}
                        </header>

                        <div className="min-w-0 overflow-x-auto">
                            <TablePrimitive className="w-full text-sm">
                                <TableHeaderPrimitive>
                                    <TableRowPrimitive>
                                        {visibleColumns.map((column) => (
                                            <TableHeadPrimitive
                                                key={column.key}
                                                scope="col"
                                                aria-sort={column.sortable
                                                    ? sortKey === column.key
                                                        ? direction === 'asc' ? 'ascending' : 'descending'
                                                        : 'none'
                                                    : undefined}
                                                className="text-muted-foreground whitespace-nowrap px-4 py-3 text-start"
                                            >
                                                {column.sortable ? (
                                                    <Button type="button"
                                                        className="focus-visible:ring-ring inline-flex items-center gap-2 bg-transparent px-0 text-start text-inherit shadow-none focus-visible:ring-2"
                                                        onClick={() => sort(column)}
                                                    >
                                                        {column.label} <span aria-hidden="true">↕</span>
                                                    </Button>
                                                ) : column.label}
                                            </TableHeadPrimitive>
                                        ))}
                                    </TableRowPrimitive>
                                </TableHeaderPrimitive>
                                <TableBodyPrimitive>
                                    {pageRows.map((row, index) => (
                                        <TableRowPrimitive key={String(row.id ?? index)}>
                                            {visibleColumns.map((column) => {
                                                const value = String(row[column.key] ?? '—');
                                                const tone = columnBadgeTone(column, row[column.key]);
                                                return (
                                                    <TableCellPrimitive key={column.key} className="whitespace-nowrap px-4 py-3">
                                                        {column.badge ? (
                                                            Badge ? <Badge className={'rounded-md px-2 py-1 text-xs ' + badgeToneClasses[tone]}>{value}</Badge>
                                                                : <span className={'rounded-md px-2 py-1 text-xs ' + badgeToneClasses[tone]}>{value}</span>
                                                        ) : value}
                                                    </TableCellPrimitive>
                                                );
                                            })}
                                        </TableRowPrimitive>
                                    ))}
                                    {pageRows.length === 0 && (
                                        <TableRowPrimitive>
                                            <TableCellPrimitive colSpan={Math.max(1, visibleColumns.length)}
                                                className="text-muted-foreground py-12 text-center text-sm">
                                                {tx('noResults')}
                                            </TableCellPrimitive>
                                        </TableRowPrimitive>
                                    )}
                                </TableBodyPrimitive>
                            </TablePrimitive>
                        </div>

                        <footer className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-6">
                            <span aria-live="polite" className="text-muted-foreground text-xs">
                                {tx('show')} {mode === 'eloquent' ? pagination?.total ?? 0 : filtered.length} {tx('records')}
                            </span>
                            <nav aria-label={tx('page')} className="flex flex-wrap items-center gap-3">
                                {mode === 'eloquent' ? (
                                    <>
                                        {previousUrl ? <Link href={previousUrl} preserveScroll className={paginationLinkClasses}>{tx('previous')}</Link>
                                            : <span className="text-muted-foreground text-sm" aria-disabled="true">{tx('previous')}</span>}
                                        <span className="text-muted-foreground text-sm">{tx('page')} {currentPage} {tx('of')} {lastPage}</span>
                                        {nextUrl ? <Link href={nextUrl} preserveScroll className={paginationLinkClasses}>{tx('next')}</Link>
                                            : <span className="text-muted-foreground text-sm" aria-disabled="true">{tx('next')}</span>}
                                    </>
                                ) : (
                                    <>
                                        <Button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>{tx('previous')}</Button>
                                        <span className="text-muted-foreground text-sm">{tx('page')} {currentPage} {tx('of')} {lastPage}</span>
                                        <Button type="button" disabled={currentPage >= lastPage} onClick={() => setPage(currentPage + 1)}>{tx('next')}</Button>
                                    </>
                                )}
                            </nav>
                        </footer>
                    </CardContent>
                </Card>
            </section>
        );
    }

    return ShadcnTable;
}
