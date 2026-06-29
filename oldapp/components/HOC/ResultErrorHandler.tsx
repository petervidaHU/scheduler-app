"use client";
import { useStore } from "@/store/store";
import { useEffect } from "react";
import { errorToast } from "../toast/toastTemplates";

export function ResultHandler({ error, children }: { error: string | null; children: React.ReactNode }) {
    const { addToast } = useStore();
  useEffect(() => {
    if (error) addToast(errorToast(error));
  }, [error]);
  return <>{children}</>;
}