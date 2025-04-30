import { Group, Text } from "@mantine/core";
import React, { FC } from "react";
import ActionIconX from "../UI-elements/ActionIcons/X";
import { useStore } from "@/store/store";

interface props {
  lessonId: string;
}

const TimeslotFilledCard: FC<props> = ({ lessonId }) => {
  const {
    tenancyBasedData: { subjects, teachers, classRooms },
    scheduleState: { lessons },
    deleteOneLesson
  } = useStore();

  const handleDeleteLesson = (event: any, id: string) => {
    event.stopPropagation();
    deleteOneLesson(id);
  };

  const lesson = lessons[lessonId];

  // TODO fix input props below

  return (
    <Group>
      <Text size="s">{subjects[lesson.subject].SUBJECT_NAME}</Text>
      <Text size="xs">
        {lesson.teacher && teachers[lesson.teacher].TEACHER_NAME}
      </Text>
      <Text size="xs">
        {lesson.classRoom && classRooms[lesson.classRoom].CLASSROOM_NAME}
      </Text>
      <ActionIconX
        label="delete"
        onClickCallback={(e) => handleDeleteLesson(e, lesson.tempId)}
      />
    </Group>
  );
};

export default TimeslotFilledCard;
