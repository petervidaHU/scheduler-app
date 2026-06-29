import CreateTimeslotTemplate from "@/components/forms/CreateTimeslotTemplate";
import { ManageFormServerProps } from "@/types/FormActionType";
import React from "react";
import { getDayTemplates } from "./_actions/getDayTemplates";

const timeslotsPage = async () => {
  const id = null;
  const serverProps: ManageFormServerProps = {
    backBtnUrl: id ? "/my-tenancy/admin" : "/my-tenancy",
    backBtnText: id ? "Go Back" : "Cancel",
    submitBtnText: id ? "Update Timeslot template" : "Create Timeslot template",
    toastMessage: id
      ? "Timeslot template updated successfully"
      : "Timeslot template created successfully",
  };
  const dayTemplates = await getDayTemplates();

  return (
    <>
     
      <CreateTimeslotTemplate {...serverProps} dayTemplates={dayTemplates}/>
    </>
  );
};

export default timeslotsPage;
