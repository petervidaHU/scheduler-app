'use client';

import React, { FC, useActionState, useTransition } from 'react'
import { manageTimeslotTemplates } from '@/app/[locale]/(tenancy)/my-tenancy/timeslots/_actions/manageTimeslotTemplates';
import { useFormResponse } from '@/lib/hooks/useFormResponse';
import { useStore } from '@/store/store';
import { Timeslots } from '@/types/databaseTypes';
import { Entities } from '@/types/Entities';
import { FormActionType, ManageFormServerProps } from '@/types/FormActionType';
import { Button, Container, Group, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { redirect } from 'next/navigation';

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
      } = useStore();
      const [isPending, startTransition] = useTransition();
      const [timeslotTemplateState, tstAction] = useActionState(manageTimeslotTemplates, {
        ...init,
      });
    
      const classRoomForm = useForm({
        initialValues: {
          name: entity?.NAME || "",
          description: entity?.DESCRIPTION || "",
          id: entity?.ID || null,
        },
        validate: {},
      });
    
      const { manageState } = useFormResponse(
        timeslotTemplateState,
        entity?.ID ? null : classRoomForm, // reset form only on create
        toastMessage,
        Entities.classroom
      );
      manageState();
    
      const handleSubmit = (values: typeof classRoomForm.values) => {
        startTransition(() => {
          tstAction(values);
        });
      };
    
      if (error) return (
        <Container size="md" my="xl">
          <p>{error}</p>
        </Container>
      );
  return (
   <Container size="md" my="xl">
         {specialties.error && <p>{specialties.error}</p>}
         {specialties.isLoading && <p>Loading specialities</p>}
         <form onSubmit={classRoomForm.onSubmit(handleSubmit)}>
           <Stack>
             <TextInput
               label="Template Name"
               placeholder="Enter template name"
               {...classRoomForm.getInputProps("name")}
               required
             />
             <TextInput
               label="Description"
               placeholder="Short description of the template"
               {...classRoomForm.getInputProps("description")}
             />
             <Group mt="md">
               <Button disabled={isPending} type="submit">
                 {submitBtnText}
               </Button>
             </Group>
           </Stack>
         </form>
         <Button onClick={() => redirect(backBtnUrl)}>{backBtnText}</Button>
       </Container>
  )
}

export default CreateTimeslotTemplate
