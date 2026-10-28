// #4471 split by what the reports describe. causes.ts places a report by tenant and channel; the desk's
// one-day-move notes (desk-notes.json) are reports that place says nothing about: a day lost, not a
// day and month swapped. Here they get a cause of their own instead of a footnote.
import { groupByCause, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type SplitCause = CauseGroup['cause'] | 'shift';
export type SplitGroup = Omit<CauseGroup, 'cause'> & { cause: SplitCause };

function shiftGroup(rs: Report[]): SplitGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    cause: 'shift',
    reports: rs,
    taggedAs: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }), {}),
    tenants: new Set(rs.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    mergedInto: [...new Set(rs.flatMap((r) => (r.mergedInto ? [r.mergedInto] : [])))],
  };
}

export function splitByCause(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): SplitGroup[] {
  const shifted = reports.filter((r) => oneDayMove.includes(r.id));
  const rest = reports.filter((r) => !oneDayMove.includes(r.id));
  const groups: SplitGroup[] = groupByCause(rest, tenantOf);
  if (shifted.length) groups.push(shiftGroup(shifted));
  return groups.sort((a, b) => b.reports.length - a.reports.length);
}

export { uniqueById };
