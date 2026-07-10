// components/org/department-creator.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  createDepartmentAction,
  type OrgActionState,
} from '@/(dashboard)/dashboard/org/actions';
import type { Department } from '@/types/database.types';

const INITIAL_STATE: OrgActionState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-secondary px-3 py-2 text-sm font-medium disabled:opacity-60"
    >
      {pending ? 'Adding…' : 'Add department'}
    </button>
  );
}

export function DepartmentCreator({
  organizationId,
  departments,
}: {
  organizationId: string;
  departments: Department[];
}) {
  const boundAction = createDepartmentAction.bind(null, organizationId);
  const [state, formAction] = useActionState(boundAction, INITIAL_STATE);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => (
          <span key={dept.id} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
            {dept.name}
          </span>
        ))}
        {departments.length === 0 && (
          <span className="text-sm text-muted-foreground">No departments yet.</span>
        )}
      </div>

      <form action={formAction} className="flex items-end gap-3">
        <div>
          <label htmlFor="deptName" className="mb-1.5 block text-xs font-medium">
            New department
          </label>
          <input
            id="deptName"
            name="name"
            required
            placeholder="e.g. Sales"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <SubmitButton />
      </form>

      {state.status === 'error' && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </div>
  );
}
