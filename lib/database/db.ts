import oracledb from 'oracledb';
import path from 'path';

class DatabaseService {
  connection: any;
  constructor() {
    this.connection = null;
  }

  async connect() {
    process.env.TNS_ADMIN = path.join(__dirname, 'wallet');
    const dbConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    };

    try {
      this.connection = await oracledb.getConnection(dbConfig);
    } catch (err) {
      console.log('Error connecting to Oracle database:', err);
    }
  }

  async executeQuery(query: string, bindVariables: any[], params: any =  { outFormat: oracledb.OUT_FORMAT_OBJECT }) {
    if (!this.connection) {
      await this.connect();
    }
    const result = await this.connection.execute(query, bindVariables, params);
    return result.rows;
  }

  async closeConnection() {
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export default DatabaseService;