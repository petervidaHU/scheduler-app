import DatabaseService from "./db";

const db = await DatabaseService.getInstance();

export default db;