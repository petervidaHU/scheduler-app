import { useStore } from "@/store/store";
import { useEffect } from "react";

export const useFormResponse = (
  state: { success: boolean; error: any },
  form: any,
  successMessage: string
) => {
  const { addToast } = useStore();
  const manageState = () => useEffect(() => {
    if (state.success === true) {
      if (form ) form.reset();
      state.success = false;

      addToast({
        message: successMessage,
        title: "Success",
        type: "success",
        autoClose: true,
        id: Date.now().toString(),
      });
    } else if (state.error) {
      addToast({
        message: state.error.message || "Something went wrong",
        title: "Error",
        type: "error",
        autoClose: true,
        id: Date.now().toString(),
      });
    }
  }, [state]);

  return { manageState };
};
