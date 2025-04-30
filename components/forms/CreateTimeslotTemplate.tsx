"use client";

import React, { FC, useActionState, useState, useTransition } from "react";
import { manageTimeslotTemplates } from "@/app/[locale]/(tenancy)/my-tenancy/timeslots/_actions/manageTimeslotTemplates";
import { useTenancyBasedFormResponse } from "@/lib/hooks/useFormResponse";
import { useStore } from "@/store/store";
import { Timeslots } from "@/types/databaseTypes";
import { FormActionType, ManageFormServerProps } from "@/types/FormActionType";
import {
  Button,
  Container,
  Grid,
  Group,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { redirect } from "next/navigation";
import GridContainer from "../day-planner/GridContainer";
import HourGrid from "../day-planner/HourGrid";
import CreateTimeslot from "./CreateTimeslot";
import DayPlanner from "../day-planner/DayPlanner";
import TimeslotsList from "../day-planner/TimeslotsList";

const init: FormActionType = {
  error: null,
  data: null,
  success: false,
};

interface props extends ManageFormServerProps {
  entity?: Timeslots;
  error?: string;
}

const CreateTimeslotTemplate: FC<props> = ({
  entity,
  error,
  backBtnUrl,
  backBtnText,
  submitBtnText,
  toastMessage,
}) => {
  const {
    tenancyBasedData: { specialties },
    activeTimeslots,
    windowHeight,
  } = useStore();
  const [isPending, startTransition] = useTransition();
  const [timeslotTemplateState, tstAction] = useActionState(
    manageTimeslotTemplates,
    { ...init }
  );
  const [selectedTimeslot, setSelectedTimeslot] = useState<number | null>(null);

  const templateForm = useForm({
    initialValues: {
      name: entity?.NAME || "",
      description: entity?.DESCRIPTION || "",
      id: entity?.ID || null,
    },
    validate: {},
  });

  const { manageState } = useTenancyBasedFormResponse(
    timeslotTemplateState,
    entity?.ID ? null : templateForm, // reset form only on create
    toastMessage
  );
  manageState();

  const handleSubmit = (values: typeof templateForm.values) => {
    startTransition(() => {
      tstAction(values);
    });
  };

  // TODO useMemo
  const timeslotMapping = () =>
    Object.values(activeTimeslots).map((timeslot) => ({
      timeslot: timeslot,
    }));

    const handleClickOnTimeslot = (id: number) => {
      console.log('in handle id:', id);
      setSelectedTimeslot(id);
    };

  if (error)
    return (
      <Container size="md" my="xl">
        <p>{error}</p>
      </Container>
    );

  return (
    <Container size="md" my="xl">
      {specialties.error && <p>{specialties.error}</p>}
      {specialties.isLoading && <p>Loading specialities</p>}
      <form onSubmit={templateForm.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Template Name"
            placeholder="Enter template name"
            {...templateForm.getInputProps("name")}
            required
          />
          <TextInput
            label="Description"
            placeholder="Short description of the template"
            {...templateForm.getInputProps("description")}
          />

          <Group mt="md">
            <Button disabled={isPending} type="submit">
              {submitBtnText}
            </Button>
            <Button onClick={() => redirect(backBtnUrl)}>{backBtnText}</Button>
          </Group>
        </Stack>
      </form>

      <CreateTimeslot key={selectedTimeslot?.toString()} timeslotId={selectedTimeslot} />

      <Grid>
        <Grid.Col span={4}>
          <GridContainer windowHeight={windowHeight}>
            <HourGrid />
            <TimeslotsList
              timeSlots={timeslotMapping()}
              onClickHandler={handleClickOnTimeslot}
            />
          </GridContainer>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default CreateTimeslotTemplate;
