import { UIFeedbackType } from "@/types/UIFeedbackTypes";

export const errorToast = (message: string = 'There is an error', isAutoClose = true) => ({
  title: "Error",
  message: message,
  type: UIFeedbackType.Error,
  autoClose: isAutoClose    ,
  closable: true,
  id: Date.now().toString(),
});
export const successToast = () => ({
  title: "Success",
  message: "Operation completed successfully",
  type: UIFeedbackType.Success,
  autoClose: true,
  closable: true,
  id: Date.now().toString(),
});
export const warningToast = () => ({
  title: "Warning",
  message: "Please check your input",
  type: UIFeedbackType.Warning,
  autoClose: true,
  closable: true,
  id: Date.now().toString(),
});
