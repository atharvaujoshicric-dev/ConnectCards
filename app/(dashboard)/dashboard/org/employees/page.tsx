// app/(dashboard)/dashboard/org/employees/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrganizationForUser, getSeatUsage } from '@/lib/services/organizations';
import { InviteEmployeeForm } from '@/components/org/invite-employee-form';
import { EmployeeRoster } from '@/components/org/employee-roster';
import { DepartmentCreator } from '@/components/org/department-creator';

export default async function EmployeesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const membership = await getOrganizationForUser(supabase, user.id);
  if (!membership) {
    redirect('/dashboard/org');
  }

  const { organization } = membership;

  const [{ data: employees }, { data: departments }, seatUsage] = await Promise.all([
    supabase
      .from('employees')
      .select('*')
      .eq('organization_id', organization.id)
      .order('invited_at', { ascending: false }),
    supabase.from('departments').select('*').eq('organization_id', organization.id).order('name'),
    getSeatUsage(supabase, organization.id),
  ]);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Employees</h1>
        <p className="mt-1 text-muted-foreground">
          {seatUsage.seatsUsed} of {seatUsage.seatsAllowed || 'unlimited'} seats used.
        </p>
      </div>

      <section className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Departments</h2>
        <DepartmentCreator organizationId={organization.id} departments={departments ?? []} />
      </section>

      <section className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Invite an employee</h2>
        <InviteEmployeeForm organizationId={organization.id} departments={departments ?? []} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">Roster</h2>
        <EmployeeRoster
          employees={employees ?? []}
          departments={departments ?? []}
          organizationId={organization.id}
        />
      </section>
    </div>
  );
}
