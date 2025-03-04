import oracledb, {
  BindParameters,
  ExecuteOptions,
  OUT_FORMAT_OBJECT,
} from "oracledb";
import path from "path";

const ADMIN_ROLE_ID = 1;

class DatabaseService {
  connection: oracledb.Connection | null;
  constructor() {
    this.connection = null;
  }

  async connect() {
    process.env.TNS_ADMIN = path.join(__dirname, "wallet");
    const dbConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    };

    try {
      this.connection = await oracledb.getConnection(dbConfig);
    } catch (err) {
      console.log("Error connecting to Oracle database:", err);
    }
  }

  async executeQuery(
    query: string,
    bindVariables: BindParameters,
    params: ExecuteOptions = { outFormat: OUT_FORMAT_OBJECT },
  ): Promise<oracledb.Result<any> | null> {
    if (!this.connection) {
      console.log("Connecting to Oracle database...");
      await this.connect();
    }
    //console.log('Executing query:', query);
    const result = await this.connection?.execute(query, bindVariables, params);
    await this.connection?.commit();
    console.log('execute Query result:', result);
    return result || null;
  }
  async executeCommand(
    query: string,
    bindVariables: BindParameters,
    params: ExecuteOptions = { outFormat: OUT_FORMAT_OBJECT },
    autocommit: boolean = true,
  ): Promise<oracledb.Result<any> | null> {
    if (!this.connection) {
      console.log("Connecting to Oracle database...");
      await this.connect();
    }
    //console.log('Executing query:', query);
    const result = await this.connection?.execute(query, bindVariables, params);
    await this.connection?.commit();
    // console.log('Query result:', result);
    return result || null;
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
    console.log("bind variables in getuserbyemnail", bindVariables);
    const result = await this.executeQuery(query, bindVariables);
    console.log("result in getuserbyemail", result);
    return result?.rows && result?.rows.length > 0 ? result.rows[0] : null;
  }

  async createUser(
    email: string,
    password: string,
    firstname: string,
    lastname: string
  ) {
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
      return result?.rows || [];
    } catch (error) {
      console.error(`Error getting all users: ${error}`);
      throw error;
    }
  }

  async insertUserRoles(userId: number, tenancyId: number, roleId: number) {
    const query = `INSERT INTO user_roles (user_id, tenancy_id, role_id) VALUES (:userId, :tenancyId, :roleId)`;
    const bindVariables = [userId, tenancyId, roleId];
    this.executeQuery(query, bindVariables);
  }

  // tenancy

  async getTenancyByName(name: string) {
    const query = `SELECT * FROM tenancies WHERE name = :name`;
    const bindVariables = [name];
    const result = await this.executeQuery(query, bindVariables);
    return result?.[0] || null;
  }

  async createTenancy(tenancyName: string, userEmail: string): Promise<number> {
    try {
      const userResult = await this.getUserByEmail(userEmail);
      if (!userResult || userResult?.rows?.length === 0) {
        throw new Error(
          "The provided email does not match any registered user."
        );
      }
      const userId = userResult.rows[0].USER_ID;

      const tenancyCheckResult = await this.getTenancyByName(tenancyName);
      if (tenancyCheckResult.rows && tenancyCheckResult.rows.length > 0) {
        throw new Error("The tenancy name is already in use.");
      }

      const insertTenancyQuery = `
        INSERT INTO tenancies (name)
        VALUES (:name)
        RETURNING id INTO :newId
      `;
      const bindVars = {
        name: tenancyName,
        newId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      };
      const tenancyResult = await this.executeQuery(
        insertTenancyQuery,
        bindVars
      );
      const newTenancyId = tenancyResult.outBinds.newId[0];

      await this.insertUserRoles(userId, newTenancyId, ADMIN_ROLE_ID);

      await this.connection.commit();
      return newTenancyId;
    } catch (error) {
      await this.connection.rollback();
      throw error;
    } finally {
      // await this.connection.close();
    }
  }
}

export default DatabaseService;
