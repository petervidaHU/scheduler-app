"use server";

import { FormActionType } from "@/types/FormActionType";

export const manageTimeslotTemplates = async (
  state: FormActionType,
  context: any,
): Promise<FormActionType> => {
  return {
    data: null,
    success: true,
    error: null,
  };
};
