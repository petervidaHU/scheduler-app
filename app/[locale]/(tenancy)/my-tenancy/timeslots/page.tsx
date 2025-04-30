import CreateTimeslotTemplate from "@/components/forms/CreateTimeslotTemplate";
import { ManageFormServerProps } from "@/types/FormActionType";
import React from "react";

const timeslotsPage = () => {
  const id = null;
  const serverProps: ManageFormServerProps = {
    backBtnUrl: id ? "/my-tenancy/admin" : "/my-tenancy",
    backBtnText: id ? "Go Back" : "Cancel",
    submitBtnText: id ? "Update Timeslot template" : "Create Timeslot template",
    toastMessage: id
      ? "Timeslot template updated successfully"
      : "Timeslot template created successfully",
  };

  return (
    <>
      <div>Available timeslot templates:</div>
      <div>TBD</div>
      <div>Create new template:</div>
      <CreateTimeslotTemplate {...serverProps}/>
    </>
  );
};

export default timeslotsPage;
