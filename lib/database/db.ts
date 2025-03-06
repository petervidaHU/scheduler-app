import { auth } from "@/app/api/auth/[...nextauth]/route";
import { ROLES } from "@/constants/constants";
import { Roles, User, UserSession } from "@/types/UserTypes";
import oracledb, {
  BindParameters,
  ExecuteOptions,
  OUT_FORMAT_OBJECT,
  Result,
} from "oracledb";
import path from "path";
import { getRoleName } from "../utils";

class DatabaseService {
  constructor() {}

  async getTenancy() {
    const session = await auth();
    if (session) {
      const tenancyId = (session.user as UserSession).tenancyId;
      if (tenancyId !== null) {
        return tenancyId;
      }
    }
    throw new Error("User or tenancy not authenticated");
  }

  async getConnection(): Promise<oracledb.Connection> {
    process.env.TNS_ADMIN = path.join(__dirname, "wallet");
    const dbConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    };
    console.log("Connecting to Oracle database...");
    try {
      return await oracledb.getConnection(dbConfig);
    } catch (err) {
      console.error("Error connecting to Oracle database:", err);
      throw err;
    }
  }

  async executeQuery(
    query: string,
    bindVariables: BindParameters,
    connectionParam: oracledb.Connection | null = null,
    params: ExecuteOptions = { outFormat: OUT_FORMAT_OBJECT }
  ): Promise<unknown[]> {
    const conn = connectionParam || (await this.getConnection());
    let result: oracledb.Result<unknown>;

    try {
      result = await conn.execute(query, bindVariables, params);
    } catch (error) {
      console.error(`Error executing ${query} query: ${error}`);
      throw error;
    } finally {
      if (!connectionParam && conn) {
        await conn.close();
      }
    }
    if (!result || !result["rows"]) {
      throw new Error("The database query resulted no result");
    } else {
      return result.rows;
    }
  }

  async executeCommand(
    query: string,
    bindVariables: BindParameters,
    autocommit: boolean = true,
    connectionParam: oracledb.Connection | null = null,
    params: ExecuteOptions = { outFormat: OUT_FORMAT_OBJECT }
  ): Promise<oracledb.Result<any>> {
    const conn = connectionParam || (await this.getConnection());
    let result: oracledb.Result<unknown>;

    try {
      result = await conn.execute(query, bindVariables, params);
      if (autocommit) await conn.commit();
    } catch (error) {
      throw error;
    } finally {
      // closing self managed connection, but keep open if connection comes from scope
      if (!connectionParam) {
        await conn.close();
      }
    }

    if (!result) {
      throw new Error(
        "The database query resulted no result or error in database executeCommand"
      );
    }
    return result;
  }

  // user
  async getUserByEmail(
    email: string,
    conn: oracledb.Connection | null = null
  ): Promise<User> {
    const query = `SELECT * FROM users WHERE email = :email`;
    const bindVariables = [email];
    try {
      const result = (await this.executeQuery(
        query,
        bindVariables,
        conn
      )) as User[];
      if (result.length === 0) {
        throw new Error("User not found");
      }
      return result[0];
    } catch (error) {
      console.error(`Error getting user by email: ${error}`);
      throw error;
    }
  }

  async getUserRoleInTenancy(
    userId: string,
    tenancyId: string,
    conn: oracledb.Connection | null = null
  ): Promise<Roles> {
    const query = `SELECT role_id FROM user_roles WHERE user_id = :userId AND tenancy_id = :tenancyId`;
    const bindVariables = [userId, tenancyId];
    try {
      const result = (await this.executeQuery(
        query,
        bindVariables,
        conn
      )) as { ROLE_ID: number }[];
      if (result.length === 0) {
        throw new Error("User not found");
      }

      return getRoleName(result[0].ROLE_ID);
    } catch (error) {    
      console.error(`Error getting user role in tenancy: ${error}`);
      throw error;
    }
  }
  
  async createUser(
    email: string,
    password: string,
    firstname: string,
    lastname: string
  ) {
    const conn = this.getConnection();
    const query = `INSERT INTO users (email, password_hash, first_name, last_name) VALUES (:email, :password, :firstname, :lastname)`;
    const bindVariables = [email, password, firstname, lastname];
    const result = await this.executeCommand(query, bindVariables);
    const tenancy = await this.createTenancy("self-tenancy", email);
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const query = `SELECT * FROM users`;
      // console.log(`Executing query: ${query}`);
      const result = (await this.executeQuery(query, [])) as User[];
      // console.log(`Query result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.error(`Error getting all users: ${error}`);
      throw error;
    }
  }

  async getUserByEmailInTenancy(
    email: string,
    conn: oracledb.Connection | null = null
  ): Promise<User> {
    try {
      const tenancyId = await this.getTenancy();
      const query = `
        SELECT u.*
        FROM users u
        INNER JOIN user_roles ur ON u.user_id = ur.user_id
        WHERE u.email = :email 
          AND ur.tenancy_id = :tenancyId
      `;
      const bindVariables = { email, tenancyId };
      const result = (await this.executeQuery(query, bindVariables, conn)) as User[];
      if (result.length === 0) {
        throw new Error("User not found within the current tenancy.");
      }
      return result[0];
    } catch (error) {
      console.error(`Error getting user by email: ${error}`);
      throw error;
    }
  }

  async getAllUsersInTenancy(): Promise<User[]> {
    try {
      const tenancyId = await this.getTenancy();
      const query = `
        SELECT *
        FROM users
        WHERE user_id IN (
          SELECT user_id
          FROM user_roles
          WHERE tenancy_id = :tenancyId
        )
      `;
      const bindVariables = { tenancyId };
      const result = (await this.executeQuery(query, bindVariables)) as User[];
      return result;
    } catch (error) {
      console.error(`Error getting all users: ${error}`);
      throw error;
    }
  }

  async insertUserRoles(
    userId: number,
    tenancyId: number,
    roleId: number,
    conn: oracledb.Connection | null = null
  ) {
    const query = `INSERT INTO user_roles (user_id, tenancy_id, role_id) VALUES (:userId, :tenancyId, :roleId)`;
    const bindVariables = [userId, tenancyId, roleId];
    const result = await this.executeCommand(query, bindVariables, false, conn);
    // console.log("insertUserRoles result", result);
    return result;
  }

  // tenancy

  async getTenancyByName(
    name: string,
    conn: oracledb.Connection | null = null
  ) {
    const query = `SELECT * FROM tenancies WHERE name = :name`;
    const bindVariables = [name];
    const result = await this.executeQuery(query, bindVariables, conn);
    return result;
  }

  async createTenancy(tenancyName: string, userEmail: string): Promise<number> {
    const conn = await this.getConnection();
    try {
      const userResult = await this.getUserByEmail(userEmail, conn);

      const userId = userResult.USER_ID;

      const insertTenancyQuery = `
        INSERT INTO tenancies (tenancy_name)
        VALUES (:name)
        RETURNING tenancy_id INTO :newId
      `;
      const bindVars = {
        name: tenancyName,
        newId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      };
      const tenancyResult = await this.executeCommand(
        insertTenancyQuery,
        bindVars,
        false, // autocommit
        conn
      );
      const newTenancyId = tenancyResult.outBinds.newId[0];

      await this.insertUserRoles(userId, newTenancyId, ROLES.admin, conn);
      await conn.commit();

      return newTenancyId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  async getTenanciesByUser(userEmail: string): Promise<any[]> {
    const conn = await this.getConnection();
    const userResult = await this.getUserByEmail(userEmail, conn);
    const userId = userResult.USER_ID;
    const query = `
    SELECT t.*, ur.role_id, r.role_name
    FROM tenancies t
    JOIN user_roles ur ON t.tenancy_id = ur.tenancy_id
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = :userId
  `;
    const bindVariables = [userId];
    try {
      const result = await this.executeQuery(query, bindVariables, conn);
      return result;
    } catch (error) {
      console.error(`Error getting tenancies by user: ${error}`);
      throw error;
    }
  }
}

export default DatabaseService;
