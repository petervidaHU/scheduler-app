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
  if (!lesson) return null;

  return (
    <Group>
      <Text size="s">{subjects.data?.[lesson.subject]?.NAME || 'Unknown Subject'}</Text>
      <Text size="xs">
        {lesson.teacher && teachers.data?.[lesson.teacher]?.NAME || 'Unknown Teacher'}
      </Text>
      <Text size="xs">
        {lesson.classRoom && classRooms.data?.[lesson.classRoom]?.NAME || 'Unknown Room'}
      </Text>
      <ActionIconX
        label="delete"
        onClickCallback={(e) => handleDeleteLesson(e, lesson.tempId)}
      />
    </Group>
  );
};

export default TimeslotFilledCard;
