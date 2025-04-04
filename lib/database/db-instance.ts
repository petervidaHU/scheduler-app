import DatabaseService from "./db";

const db = new DatabaseService();
db.getConnection();

export default db;