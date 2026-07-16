// components/leads/leads-table.tsx
import { LeadStatusSelect } from '@/components/leads/lead-status-select';
import { formatDate } from '@/lib/utils';
import type { Lead } from '@/types/database.types';

export function LeadsTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No leads yet. Once your lead capture form is live, submissions will show up here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Received</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-medium">{lead.full_name}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {lead.email ?? lead.phone ?? '\u2014'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{lead.company ?? '\u2014'}</td>
              <td className="px-4 py-3 capitalize text-muted-foreground">{lead.source}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(lead.created_at)}</td>
              <td className="px-4 py-3">
                <LeadStatusSelect leadId={lead.id} status={lead.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
