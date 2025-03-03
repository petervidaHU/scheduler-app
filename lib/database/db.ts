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

  async executeQuery(query: string, bindVariables: any[], params: any = { outFormat: oracledb.OUT_FORMAT_OBJECT }) {
    if (!this.connection) {
      console.log('Connecting to Oracle database...');
      await this.connect();
    }
    //console.log('Executing query:', query);
    const result = await this.connection.execute(query, bindVariables, params);
    await this.connection.commit();
    // console.log('Query result:', result);
    return result.rows;
  }

  async closeConnection() {
    if (this.connection) {
      await this.connection.close();
    }
  }

  // user queries
  async getUserByEmail(email: string) {
    const query = `SELECT * FROM users WHERE email = :email`;
    const bindVariables = [email];
    console.log('bind variables in getuserbyemnail', bindVariables)
    const result = await this.executeQuery(query, bindVariables);
    console.log('result in getuserbyemail', result)
    return result?.[0] || null;
  }

  async createUser(email: string, password: string, firstname: string, lastname: string) {
    // console.log('getAllUsers', await this.getAllUsers());
    const query = `INSERT INTO users (email, password_hash, first_name, last_name) VALUES (:email, :password, :firstname, :lastname)`;
    const bindVariables = [email, password, firstname, lastname];
    // console.log('bbbbbbind variables', bindVariables)
    await this.executeQuery(query, bindVariables);
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const query = `SELECT * FROM users`;
      // console.log(`Executing query: ${query}`);
      const result = await this.executeQuery(query, []);
      // console.log(`Query result: ${JSON.stringify(result)}`);
      return result.rows;
    } catch (error) {
      console.error(`Error getting all users: ${error}`);
      throw error;
    }
  }

  // tenancy
  async createTenancy(name: string, email: string) {
    const query = `INSERT INTO tenancy (name, email) VALUES (:name : email)`;
    const bindVariables = [name, email];
    await this.executeQuery(query, bindVariables);
  }
}

export default DatabaseService;