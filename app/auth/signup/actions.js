'use server';

import DatabaseService from '@/lib/database/db';
import { hashPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function handleSubmit(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const firstname = formData.get('firstname');
  const lastname = formData.get('lastname');

  const errors = {};

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
    // Handle errors (we'll discuss how to pass these back to the client)
    throw new Error(JSON.stringify(errors));
  }

  const databaseService = new DatabaseService();

  // Check if email already exists
/*   const existingUser = await databaseService.getUserByEmail(email);

  if (existingUser) {
    throw new Error(JSON.stringify({ email: 'Email address already in use' }));
  } */

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  await databaseService.createUser(email, hashedPassword, firstname, lastname);

  // Redirect to login page
  redirect('/auth/signin');
}

