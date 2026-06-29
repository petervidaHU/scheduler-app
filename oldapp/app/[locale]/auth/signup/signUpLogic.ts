'use server';

import { getDbInstance } from '@/lib/database/db-instance';
import { hashPassword } from '@/lib/utils';
import { redirect } from 'next/navigation';

export async function signupLogic(formData: FormData) {
  const db = await getDbInstance();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstname = formData.get('firstname') as string;
  const lastname = formData.get('lastname') as string;

  const errors: any = {};

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Invalid email address';
  }

  if (!firstname) {
    errors.firstname = 'First name is required';
  }

  if (!lastname) {
    errors.lastname = 'Last name is required';
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (Object.keys(errors).length > 0) {
    throw new Error(JSON.stringify(errors));
  }

  // Check if email already exists
/*   const existingUser = await databaseService.getUserByEmail(email);

  if (existingUser) {
    throw new Error(JSON.stringify({ email: 'Email address already in use' }));
  } */

  const hashedPassword = await hashPassword(password);
  await db.createUser(email, hashedPassword, firstname, lastname);

  redirect('/auth/signin');
}

