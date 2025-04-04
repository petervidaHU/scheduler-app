import DatabaseService from "./db";

const db = new DatabaseService();
db.init();

export default db;