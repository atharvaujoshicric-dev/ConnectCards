// components/org/employee-roster.tsx
'use client';

import { useTransition } from 'react';
import { UserMinus } from 'lucide-react';
import { offboardEmployeeAction } from '@/(dashboard)/dashboard/org/actions';
import { formatDate } from '@/lib/utils';
import type { Employee, Department } from '@/types/database.types';

interface EmployeeRosterProps {
  employees: Employee[];
  departments: Department[];
  organizationId: string;
}

const STATUS_STYLES: Record<string, string> = {
  invited: 'bg-secondary text-foreground',
  active: 'bg-success/15 text-success',
  suspended: 'bg-warning/15 text-warning',
  offboarded: 'bg-destructive/15 text-destructive',
};

export function EmployeeRoster({ employees, departments, organizationId }: EmployeeRosterProps) {
  const [isPending, startTransition] = useTransition();
  const departmentById = new Map(departments.map((d) => [d.id, d.name]));

  if (employees.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No employees invited yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Department</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Invited</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-medium">{employee.invited_email}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {employee.department_id ? departmentById.get(employee.department_id) : '\u2014'}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[employee.status]}`}
                >
                  {employee.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(employee.invited_at)}</td>
              <td className="px-4 py-3 text-right">
                {employee.status !== 'offboarded' && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() => offboardEmployeeAction(employee.id, organizationId))
                    }
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    Offboard
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
