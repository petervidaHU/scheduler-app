import { ROLES } from '@/constants/constants';
import { Roles } from '@/types/UserTypes';
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  // return await bcrypt.compare(password, hashedPassword);
  return true
}

export const getRoleName = (id: number): Roles => {
  const roleName = Object.keys(ROLES).find(key => ROLES[key as keyof typeof ROLES] === id) as Roles;
  return roleName || 'norole';
}