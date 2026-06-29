import { DatabaseService } from "./db";

let dbInstance: DatabaseService | null = null;

export async function getDbInstance(): Promise<DatabaseService> {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await DatabaseService.getInstance();
  return dbInstance;
}