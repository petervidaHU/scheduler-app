"use client";

import { useStore } from '@/store/store';
import React from 'react'

const SyllabusTable = () => {
    const { syllabus, days } = useStore();
  return (
    <div>SyllabusTable {' '}{JSON.stringify(syllabus)}</div>
  )
}

export default SyllabusTable