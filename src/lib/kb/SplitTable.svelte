<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { splitByCause, uniqueById, type SplitCause } from '#lib/kb/split';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // tickets: where each cause is now tracked, cause → URL.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<SplitCause, string>> } = $props();

  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const merged = $derived(uniqueById(rows));
  const groups = $derived(splitByCause(merged, tenantOf, notes.oneDayMove));
  const tags = (g: { taggedAs: Record<string, number> }) =>
    Object.entries(g.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
  const issue = (url: string) => `#${url.split('/').pop()}`;
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ({rows.length} rows in the export, {rows.length - merged.length} of them repeats) ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}, counted the desk's way
</p>

<table>
  <thead>
    <tr><th>cause</th><th>reports</th><th>tagged as</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as row (row.cause)}
      {@const g = row.group}
      <tr class:open={!tickets[row.cause]} class:within={row.within}>
        <td><code>{row.cause}</code></td>
        <td>{row.reports}{#if row.within}<span class="of">&nbsp;of the {row.within}</span>{/if}</td>
        <td class="tags">{tags(g)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[row.cause]}<a href={tickets[row.cause]}>{issue(tickets[row.cause]!)}</a>{:else}no ticket yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups.filter((row) => row.within) as row (row.cause)}
  <p class="note">{row.reports} of the {row.within} reports read as a one-day move: counted under <code>{row.within}</code>, where the desk files them by tenant, and tracked as <code>{row.cause}</code>.</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .within td:first-child { padding-left: 1.5rem; }
  .of, .note { color: var(--muted); font-size: 0.85em; }
  .open td { background: var(--warn-bg); }
  .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
