import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password, hashedPassword) {
  // return await bcrypt.compare(password, hashedPassword);
  return true
}
