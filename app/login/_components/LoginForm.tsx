"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, type LoginFormState } from "../_action/auth";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action] = useActionState<LoginFormState, FormData>(login, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Admin Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter admin password"
          aria-invalid={state.error != null}
          required
        />
      </div>
      {state.error != null && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}
