import DatabaseService from '@/lib/database/db';
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

export default async function ClassesPage() {
  const db = new DatabaseService();

  const result = await db.executeQuery(
    `SELECT * FROM classes`,
    [], // No bind variables
  );

  const classes = result;


  return (
    <div>
      <h1>Classes</h1>
      <ul>
        {classes.map((cls: { CLASS_ID: Key | null | undefined; CLASS_NAME: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
          <li key={cls.CLASS_ID}>{cls.CLASS_NAME}</li>
        ))}
      </ul>
    </div>
  );
}
