// #4471 by problem, counted the desk's way: every report where causes.ts files it (by tenant and
// channel). The reports the desk read as a one-day move (desk-notes.json) stay counted where they are
// filed, as CauseTable does, and also form a problem of their own: a day lost, not a day and month swapped.
import { groupByCause, readAs, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type SplitCause = CauseGroup['cause'] | 'shift';
export type SplitRow = { cause: SplitCause; reports: number; group: CauseGroup; within?: CauseGroup['cause'] };

export function splitByCause(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): SplitRow[] {
  const rows: SplitRow[] = [];
  for (const g of groupByCause(reports, tenantOf)) {
    rows.push({ cause: g.cause, reports: g.reports.length, group: g });
    const moved = readAs(g, oneDayMove);
    if (moved) {
      const shifted = g.reports.filter((r) => oneDayMove.includes(r.id));
      rows.push({ cause: 'shift', reports: moved, group: { ...groupByCause(shifted, tenantOf)[0] }, within: g.cause });
    }
  }
  return rows;
}

export { uniqueById };
