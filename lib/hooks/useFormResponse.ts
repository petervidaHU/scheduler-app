import { useStore } from "@/store/store";
import { Entities } from "@/types/Entities";
import { useEffect } from "react";
import { refetchTenancyBasedData } from "../UpdateTenancyBasedData";
import { labelMapper } from "./labelMapperForTenancyBasedData";

export const useTenancyBasedFormResponse = (
  state: { success: boolean; error: any },
  form: any,
  successMessage: string | null,
  label?: Entities,
  onSuccess?: () => void
) => {
  const { addToast, updateTenancyBasedData } = useStore();
  const manageState = () =>
    useEffect(() => {
      if (state.success === true) {
        if (form) form.reset();
        console.log("in custom hook,", state, label);
        if (label) {
          (async () => {
            try {
              const result = await refetchTenancyBasedData(label);
              updateTenancyBasedData({
                [labelMapper[label]]: { data: result.data },
              });
            } catch (error) {
              console.error(
                `Error refetch data after manipulating data: ${error}`
              );
              if (successMessage) {
                addToast({
                  title: "Error",
                  message: "Error refetch data",
                  type: "error",
                  autoClose: false,
                  id: Date.now().toString(),
                });
              }
            }
          })();
        }
        state.success = false;
        if (successMessage) {
          addToast({
            message: successMessage,
            title: "Success",
            type: "success",
            autoClose: true,
            id: Date.now().toString(),
          });
        }
        if (onSuccess) {
          onSuccess();
        }
      } else if (state.error) {
        if (successMessage) {
          addToast({
            message: state.error.message || "Something went wrong",
            title: "Error",
            type: "error",
            autoClose: true,
            id: Date.now().toString(),
          });
        }
      }
    }, [state]);

  return { manageState };
};
