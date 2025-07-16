// Server action to fetch syllabus data for a class by ID
'use server';
import { getDbInstance } from '@/lib/database/db-instance';

export async function getSyllabusByClassId(classId: number) {
  const db = await getDbInstance();
  try {
    // You may need to adjust this query to match your DB schema
    const syllabusData = await db.getSyllabus(classId);
    return syllabusData || [];
  } catch (error) {
    console.error('Failed to fetch syllabus data:', error);
    throw new Error('Failed to fetch syllabus data');
  }
}
