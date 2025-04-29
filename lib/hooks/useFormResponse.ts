import { useStore } from "@/store/store";
import { Entities } from "@/types/Entities";
import { useEffect } from "react";
import { refetchTenancyBasedData } from "../UpdateTenancyBasedData";
import { labelMapper } from "./labelMapperForTenancyBasedData";

export const useFormResponse = (
  state: { success: boolean; error: any },
  form: any,
  successMessage: string,
  label?: Entities
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
              updateTenancyBasedData({ [labelMapper[label]]: { data: result.data } });
            } catch (error) {
              console.error(
                `Error refetch data after manipulating data: ${error}`
              );
              addToast({
                title: "Error",
                message: "Error refetch data",
                type: "error",
                autoClose: false,
                id: Date.now().toString(),
              });
            }
          })();
        }
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
