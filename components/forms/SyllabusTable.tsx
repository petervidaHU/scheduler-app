"use client";

import { useStore } from "@/store/store";
import { Paper, Text, SimpleGrid, Divider, Group } from "@mantine/core";
import React from "react";
import NotificationCard from "../UI-elements/NotificationBadges";

const SyllabusTable = () => {
  const store = useStore();
  const { syllabus, days, scheduleState, classRooms } = useStore();
  console.log("store", store  
  );
  
  const subjectOccurrences = scheduleState.lessons.reduce((acc, lesson) => {
    const subjectId = lesson.subject.id;
    acc[subjectId] = (acc[subjectId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log("subjectOccurrences", subjectOccurrences);
  return (
    <>
      <h3>SyllabusTable </h3>
      <SimpleGrid cols={4}>
      {syllabus.subjects.map((subject) => (
        <Paper shadow="sm" withBorder p="xl" key={subject.value}>
          <Text fw={700} size="lg">{subject.label}</Text>
          <Divider my="md" />
          <Text fw={500} size="md">preferred teacher</Text>
          <Text fw={700} size="lg">{subject.preferredTeacher?.label || "none"}</Text>
          <Divider my="md" />
          <Text fw={500} size="md">placed</Text>
          <Text fw={900} size="lg">{subjectOccurrences[subject.value] || '0'} </Text>
          <Text fw={500} size="lg">planned occurence:</Text>
          <Text fw={700} size="lg">{subject.occurrence}</Text>
          <Group mt="md">
            <NotificationCard message="message" type="warning" context="classroom"/>

          </Group>
        </Paper>
      ))}
      </SimpleGrid>
    </>
  );
};

export default SyllabusTable;
