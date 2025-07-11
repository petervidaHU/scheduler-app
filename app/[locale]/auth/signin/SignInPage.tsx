"use client";

import { useSession } from "next-auth/react";
import { FC, useEffect } from "react";
import { signInLogic } from "./SigninLogic";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, Button, Paper, Stack } from "@mantine/core";
import { useForm } from '@mantine/form';

interface props {
  source: string;
}

const SignInPageLogic: FC<props> = ({ source }) => {
  const router = useRouter();
  const initialState = { error: null, success: false, redirect: null };
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await signInLogic(formData, source);
      if (result && (result as any).redirect) {
        return {
          error: null,
          success: true,
          redirect:
            (result as any).redirect === true
              ? source || "/"
              : (result as any).redirect,
        };
      }
      if (result && (result as any).error) {
        return {
          error: (result as any).error,
          success: false,
          redirect: null,
        };
      }
      return { error: null, success: true, redirect: null };
    },
    initialState
  );

  // Mantine useForm setup
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    onValuesChange: () => {
      if (state.error) {
        // Clear error if user starts typing
        state.error = null;
      }
    },
  });

  useEffect(() => {
    if (state.redirect) {
      router.push(state.redirect);
      setTimeout(() => {
        router.refresh();
      }, 100);
    }
  }, [state.redirect, router]);

  const { status } = useSession({ required: false });

  return (
    <>
      {status !== "authenticated" ? (
        <Paper withBorder p="md" radius="md" maw={400} mx="auto">
          <form
            onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              formAction(formData);
            }}
          >
            <Stack>
              <TextInput
                label="Email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                {...form.getInputProps('email')}
              />
              <TextInput
                label="Password"
                name="password"
                type="password"
                placeholder="Your password"
                required
                {...form.getInputProps('password')}
              />
              {state.error && (
                <div style={{ color: 'red' }}>{state.error}</div>
              )}
              <Button type="submit" loading={isPending} fullWidth>
                Sign In
              </Button>
            </Stack>
          </form>
        </Paper>
      ) : (
        <div>
          {state.success ? "sucessfully signed in!" : "you already logged in!"}
        </div>
      )}
    </>
  );
};

export default SignInPageLogic;
