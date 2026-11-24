"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { FormState } from "@/lib/validation";

/**
 * Like useActionState, but submits via onSubmit so React does NOT clear the
 * form afterwards. If saving fails, everything the user typed stays put.
 * Use: <form onSubmit={onSubmit}> and <SubmitButton pending={pending}>.
 */
export function useFormAction(
  action: (state: FormState, formData: FormData) => Promise<FormState>,
  initial: FormState = {},
) {
  const [state, dispatch, pending] = useActionState<FormState, FormData>(action, initial);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => dispatch(formData));
  };
  return { state, onSubmit, pending };
}
