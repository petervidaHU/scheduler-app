// app/classes/page.tsx

import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';
import { oracledb, dbConfig } from '../db'; // Adjust the import path

export default async function ClassesPage() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT * FROM classes`,
      [], // No bind variables
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const classes = result.rows;

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
  } catch (err) {
    console.error('Error connecting to Oracle database:', err);
    return <div>Error connecting to the database.</div>;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}
