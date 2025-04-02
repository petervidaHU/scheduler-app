"use client";

import { useStore } from "@/store/store";
import { Select } from "@mantine/core";
import React from "react";

const SyllabusTable = () => {
  const { syllabus, days } = useStore();

  return (
    <>
      <h3>SyllabusTable </h3>
          <Select  data={[
              { value: 'react', label: 'React' },
              { value: 'ng', label: 'Angular' },
            ]}  />
      {syllabus.subjects.map((subject) => (
        <div key={subject.value}>
          <p>{subject.label}</p>
          <p>{subject.preferredTeacher?.label || ''}</p>
          <p>{subject.occurrence}</p>
        </div>
      ))}
    </>
  );
};

export default SyllabusTable;
