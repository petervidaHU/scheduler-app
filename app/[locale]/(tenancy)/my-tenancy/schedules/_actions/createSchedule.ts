'use server';

export async function createSchedule(state, formData: any) {
  // Parse the form data
  const days = Number(formData.get('days'));
  const classType = formData.get('class') as string;
  const variations = Number(formData.get('variations'));
  const description = formData.get('description') as string;

  console.log('Creating schedule:', { days, classType, variations, description });

  return { success: true, data: null, error: null };
}
