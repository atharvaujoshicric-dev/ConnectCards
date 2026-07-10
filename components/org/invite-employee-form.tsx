// components/org/invite-employee-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { inviteEmployeeAction, ORG_ACTION_INITIAL_STATE } from '@/(dashboard)/dashboard/org/actions';
import type { Department } from '@/types/database.types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
    >
      {pending ? 'Inviting…' : 'Send invite'}
    </button>
  );
}

export function InviteEmployeeForm({
  organizationId,
  departments,
}: {
  organizationId: string;
  departments: Department[];
}) {
  const boundAction = inviteEmployeeAction.bind(null, organizationId);
  const [state, formAction] = useActionState(boundAction, ORG_ACTION_INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex-1">
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium">
          Employee email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="name@company.com"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {state.fieldErrors?.email?.map((e) => (
          <p key={e} className="mt-1 text-xs text-destructive">
            {e}
          </p>
        ))}
      </div>

      <div>
        <label htmlFor="departmentId" className="mb-1.5 block text-xs font-medium">
          Department
        </label>
        <select
          id="departmentId"
          name="departmentId"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">No department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton />

      {state.status === 'error' && state.message && (
        <p className="w-full text-sm text-destructive">{state.message}</p>
      )}
      {state.status === 'success' && (
        <p className="w-full text-sm text-success">{state.message}</p>
      )}
    </form>
  );
}
