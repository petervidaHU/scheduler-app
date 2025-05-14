import { auth } from "@/app/api/auth/[...nextauth]/route";
import { ROLES } from "@/constants/constants";
import { Roles, User, UserSession } from "@/types/UserTypes";
import oracledb, {
  BindParameters,
  ExecuteOptions,
  OUT_FORMAT_OBJECT,
} from "oracledb";
import path from "path";
import { getRoleName } from "../utils";
import {
  DayTemplates,
  GetTenancyByUserResult,
  ID,
  Syllabus,
  Timeslots,
  Frame,
} from "@/types/databaseTypes";
import { LessonInput } from "@/types/FormActionType";
import { Entities } from "@/types/Entities";
import { labelMapper } from "../hooks/labelMapperForTenancyBasedData";
import { OccupiedTimeslot, SyllabusFormProperties } from "@/types/ScheduleTypes";

const tableNameMapping: Record<Entities, string> = {
  specialty: "specialties",
  classroom: "classrooms",
  subject: "subjects",
  teacher: "teachers",
  class: "classes",
  frame: "frames",
} as Record<Entities, string>;

interface ExtendedExecuteOptions extends ExecuteOptions {
  bindDefs?: {
    type: any;
    dir: any;
    name: string;
  }[];
}

export class DatabaseService {
  private static instance: DatabaseService;
  private static initialized = false;
  private pool: oracledb.Pool | undefined;
  private tenancyId: ID | null = null;

  constructor() { }

  public static async getInstance(): Promise<DatabaseService> {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
      if (!DatabaseService.initialized) {
        await DatabaseService.instance.init();
        DatabaseService.initialized = true;
      }
    }
    return DatabaseService.instance;
  }
  async setTenancyFromSession() {
    const session = await auth();
    if (session) {
      const tenancyId = (session.user as UserSession).tenancyId;
      if (tenancyId !== null) {
        this.tenancyId = tenancyId as unknown as number;
      }
    }
  }

  async init(): Promise<void> {
    console.log(
      "++++++++++ Initializing Oracle database connection pool & Tenancy Id +++++++++++++"
    );
    this.setTenancyFromSession();
    if (this.pool) {
      console.log(
        "Number of available connections in pool:",
        this.pool.connectionsOpen
      );
      return;
    }

    process.env.TNS_ADMIN = path.join(__dirname, "wallet");
    const dbConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    };
    console.log("OCI Connecting to Oracle database...");
    try {
      this.pool = await oracledb.createPool({
        ...dbConfig,
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 2,
      });
    } catch (err) {
      console.error("OCI Error connecting to Oracle database:", err);
      throw err;
    }
  }

  setTenancy(value: number) {
    this.tenancyId = value;
  }

  getTenancy(): number {
    if (!this.tenancyId) throw new Error("Tenancy not set");
    return this.tenancyId;
  }

  async executeQuery(
    query: string,
    bindVariables: BindParameters | Array<any>,
    params: ExecuteOptions = { outFormat: OUT_FORMAT_OBJECT }
  ): Promise<unknown[]> {
    let result: oracledb.Result<unknown>;

    let finalQuery = query;
    let bindVars: BindParameters | Array<any> = bindVariables;

    // Only convert array to named if the query uses positional placeholders
    if (Array.isArray(bindVariables) && query.includes('?')) {
      bindVars = bindVariables.reduce((acc, val, i) => ({ ...acc, [`b${i}`]: val }), {});
      let idx = 0;
      finalQuery = query.replace(/\?/g, () => `:b${idx++}`);
    }

    const conn = await oracledb.getConnection();
    if (!conn) throw new Error("No connection available");
    try {
      result = await conn.execute(finalQuery, bindVars, params);
    } catch (error) {
      console.error(`Error executing query: ${error}`);
      console.error('Query was:', finalQuery);
      console.error('Bind variables were:', bindVars);
      throw error;
    } finally {
      conn.release();
    }

    if (!result || !result["rows"]) {
      return [];
    } else {
      return result.rows;
    }
  }

  async executeCommand(
    query: string,
    bindVariables: BindParameters,
    connectionParam: oracledb.Connection | null = null,
    params: ExtendedExecuteOptions = { outFormat: OUT_FORMAT_OBJECT }
  ): Promise<oracledb.Result<any>> {
    const conn = connectionParam || (await oracledb.getConnection());
    let result: oracledb.Result<unknown>;

    try {
      result = await conn!.execute(query, bindVariables, params);
      if (!connectionParam) await conn?.commit();
    } catch (error) {
      throw error;
    } finally {
      if (!connectionParam) {
        await conn?.close();
      }
    }

    if (!result) {
      throw new Error(
        "The database command resulted no result or error in database executeCommand"
      );
    }
    return result;
  }

  // --------------- USERS ---------------
  async getUserByEmail(email: string): Promise<User> {
    const query = `SELECT * FROM users WHERE email = :email`;
    const bindVariables = [email];
    try {
      const result = (await this.executeQuery(query, bindVariables)) as User[];
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
    tenancyId: string
  ): Promise<Roles> {
    const query = `SELECT role_id FROM user_roles WHERE user_id = :userId AND tenancy_id = :tenancyId`;
    const bindVariables = [userId, tenancyId];
    try {
      // TODO fishy result handling!
      const result = (await this.executeQuery(query, bindVariables)) as {
        ROLE_ID: number;
      }[];
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
    // tenancyId is self-tenancy
    // TODO: batch multiple command to one job?
    const query = `INSERT INTO users (email, password_hash, first_name, last_name) VALUES (:email, :password, :firstname, :lastname)`;
    const bindVariables = [email, password, firstname, lastname];
    await this.executeCommand(query, bindVariables);
    await this.createTenancy("self-tenancy", email);
  }

  async updateUser(
    id: ID,
    updateData: {
      email?: string;
      first_name?: string;
      last_name?: string;
      password_hash?: string;
    }
  ) {
    const keys = Object.keys(updateData);
    if (keys.length === 0) {
      throw new Error("No data provided for update.");
    }

    const setClauses: string[] = [];
    const bindVariables: { [key: string]: any } = {};
    const fieldOfUser = ["email", "first_name", "last_name", "password_hash"];

    fieldOfUser.forEach((field) => {
      if (updateData[field as keyof typeof updateData] !== undefined) {
        setClauses.push(`${field} = :${field}`);
        bindVariables[field] = updateData[field as keyof typeof updateData];
      }
    });

    const query = `
      UPDATE users
      SET ${setClauses.join(", ")}
      WHERE id = :id
    `;
    bindVariables.id = id;

    const result = await this.executeCommand(query, bindVariables);

    if (result.rowsAffected === 0) {
      throw new Error("User not found or no changes applied.");
    }
    return result;
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const query = `SELECT * FROM users`;
      const result = (await this.executeQuery(query, [])) as User[];
      return result;
    } catch (error) {
      console.error(`Error getting all users: ${error}`);
      throw error;
    }
  }

  async getUserByEmailInTenancy(email: string): Promise<User> {
    try {
      const tenancyId = this.getTenancy();
      const query = `
        SELECT u.*
        FROM users u
        INNER JOIN user_roles ur ON u.user_id = ur.user_id
        WHERE u.email = :email 
          AND ur.tenancy_id = :tenancyId
      `;
      const bindVariables = { email, tenancyId };
      const result = (await this.executeQuery(query, bindVariables)) as User[];
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
      const tenancyId = this.getTenancy();
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
    const result = await this.executeCommand(query, bindVariables, conn);
    return result;
  }

  // ----------------- TENANCIES -------------------

  async getTenancyByName(name: string) {
    const query = `SELECT * FROM tenancies WHERE name = :name`;
    const bindVariables = [name];
    const result = await this.executeQuery(query, bindVariables);
    return result;
  }

  async createTenancy(tenancyName: string, userEmail: string): Promise<number> {
    const conn = await this.pool?.getConnection();
    if (!conn) throw new Error("No connection available");

    try {
      const userResult = await this.getUserByEmail(userEmail);
      const userId = userResult.ID;

      const insertTenancyQuery = `
        INSERT INTO tenancies (tenancy_name)
        VALUES (:name)
        RETURNING id INTO :newId
      `;
      const bindVars = {
        name: tenancyName,
        newId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      };
      const tenancyResult = await this.executeCommand(
        insertTenancyQuery,
        bindVars,
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

  async getTenanciesByUser(
    userEmail: string
  ): Promise<Array<GetTenancyByUserResult>> {
    const userResult = await this.getUserByEmail(userEmail);
    const userId = userResult.ID;
    const query = `
    SELECT t.*, ur.role_id, r.name as role_name
    FROM tenancies t
    JOIN user_roles ur ON t.id = ur.tenancy_id
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = :userId
  `;
    try {
      const result = await this.executeQuery(query, [userId]);
      console.log(
        "*---------------------------------gettenanciesbyuser",
        result
      );
      return result as GetTenancyByUserResult[];
    } catch (error) {
      console.error(`Error getting tenancies by user: ${error}`);
      throw error;
    }
  }

  // ------------------- Tenancy Based Common -------------------
  async getAllEntity<T>(label: Entities): Promise<T[]> {
    const query = `SELECT * FROM  ${tableNameMapping[label]} WHERE(tenancy_id = :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const result = await this.executeQuery(query, [tenancyId]);
      return result as T[];
    } catch (error) {
      console.error(`Error getting array of ${label}: ${error}`);
      throw error;
    }
  }

  async getAllBasicEntity<T>(label: Entities): Promise<T[]> {
    const query = `SELECT * FROM  ${tableNameMapping[label]} WHERE(tenancy_id IS NULL)`;
    try {
      const result = await this.executeQuery(query, []);
      return result as T[];
    } catch (error) {
      console.error(`Error getting array of ${label}: ${error}`);
      throw error;
    }
  }

  async getOneEntityById<T>(id: number, label: Entities): Promise<T> {
    const query = `SELECT * FROM ${tableNameMapping[label]} WHERE id = :id AND (tenancy_id = :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const result = await this.executeQuery(query, [id, tenancyId]);
      return (result as T[])[0];
    } catch (error) {
      console.error(`Error getting ${label}: ${error}`);
      throw error;
    }
  }

  async deleteTenancyBasedData(id: number, label: Entities): Promise<void> {
    const query = `DELETE FROM ${tableNameMapping[label]} WHERE id = :id`;
    const bindVariables = [id];
    try {
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      throw error;
    }
  }

  async insertMultipleTenancyBasedData(
    label: Entities,
    keys: string[],
    data: any
  ) {
    const tenancyId = this.getTenancy();
    const rows = data
      .map((item: any) => {
        return `(${keys
          .map((key) =>
            key === "TENANCY_ID"
              ? `'${tenancyId}'`
              : item[key] === null
                ? `NULL`
                : `'${item[key]}'`
          )
          .join(", ")})`;
      })
      .join(",\n");
    const query = `INSERT INTO ${labelMapper[label]}(${keys.join(", ")}) VALUES
      ${rows} `;

    try {
      const res = await this.executeCommand(query, []);
      return { error: null, rowsAffected: res.rowsAffected };
    } catch (error) {
      return {
        error: `There is an error loading ${label}: ${error}`,
        rowsAffected: null,
      };
    }
  }

  // ----------------- SPECIALITIES ----------------------

  async createSpeciality(name: string, desc: string): Promise<void> {
    const query = `INSERT INTO specialties (name, description, tenancy_id) VALUES (:name, :description, :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = [name, desc, tenancyId];
      const res = await this.executeCommand(query, bindVariables);
    } catch (error) {
      console.error(`Error creating speciality: ${error}`);
      throw error;
    }
  }

  async updateSpeciality(
    name: string,
    desc: string,
    id: number
  ): Promise<void> {
    const query = `UPDATE specialties SET ame = :name, description = :description WHERE id = :id AND (tenancy_id = :tenancyId OR tenancy_id IS NULL)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = [name, desc, id, tenancyId];
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      console.error(`Error updating speciality: ${error}`);
      throw error;
    }
  }

  // ----------------- TIMESLOTS & DAYS ----------------------

  async getBasicTimeSlots(): Promise<Timeslots[]> {
    const query = `SELECT * FROM TIMESLOTS WHERE tenancy_id = :tenancyId OR TENANCY_ID IS NULL`;
    try {
      const tenancyId = this.getTenancy();
      const result = await this.executeQuery(query, [tenancyId]);
      return result as Timeslots[];
    } catch (error) {
      console.error(`Error getting timeslots: ${error}`);
      throw error;
    }
  }

  async getBasicDayTemplates(): Promise<Array<DayTemplates>> {
    const query = `SELECT * FROM DAY_TEMPLATES WHERE TENANCY_ID IS NULL`;
    try {
      const result = await this.executeQuery(query, []);
      return result as Array<DayTemplates>;
    } catch (error) {
      console.error(`Error getting day templates: ${error}`);
      throw error;
    }
  }

  async getDayTemplatesByTenancy(): Promise<Array<DayTemplates>> {
    const query = `SELECT * FROM DAY_TEMPLATES WHERE TENANCY_ID = :tenancyId`;
    try {
      const tenancyId = this.getTenancy();
      const result = await this.executeQuery(query, [tenancyId]);
      return result as Array<DayTemplates>;
    } catch (error) {
      console.error(`Error getting day templates: ${error}`);
      throw error;
    }
  }

  async createTimeslot(
    name: string,
    description: string,
    periodStart: number,
    periodEnd: number
  ): Promise<void> {
    const query = `INSERT INTO timeslots (name, description, period_start, period_end, tenancy_id) VALUES (:name, :description, :periodStart, :periodEnd, :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = [
        name,
        description,
        periodStart,
        periodEnd,
        tenancyId,
      ];
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      console.error(`Error creating timeslot: ${error}`);
      throw error;
    }
  }

  async createDayTemplateWithTimeslots(
    name: string,
    description: string,
    timeslots: Timeslots[]
  ): Promise<void> {
    let connection;
    try {
      connection = await oracledb.getConnection();

      const tenancyId = Number(this.getTenancy());
      const names = timeslots.map((t) => t.NAME);
      const descs = timeslots.map((t) => t.DESCRIPTION);
      const periodStarts = timeslots.map((t) => t.PERIOD_START);
      const periodEnds = timeslots.map((t) => t.PERIOD_END);

      const plsql = `
DECLARE
  -- Define associative array types for input values.
  TYPE t_names_type IS TABLE OF VARCHAR2(100) INDEX BY BINARY_INTEGER;
  TYPE t_descs_type IS TABLE OF VARCHAR2(4000) INDEX BY BINARY_INTEGER;
  TYPE t_nums_type IS TABLE OF NUMBER INDEX BY BINARY_INTEGER;
  
  v_names    t_names_type := :names;
  v_descs    t_descs_type := :descs;
  v_starts   t_nums_type  := :periodStarts;
  v_ends     t_nums_type  := :periodEnds;
  v_tenancy  NUMBER       := :tenancyId;
  
  v_ids SYS.ODCINUMBERLIST := SYS.ODCINUMBERLIST();
BEGIN
  FORALL i IN 1 .. v_names.COUNT
    INSERT INTO timeslots (name, description, period_start, period_end, tenancy_id)
    VALUES (v_names(i), v_descs(i), v_starts(i), v_ends(i), v_tenancy)
    RETURNING id BULK COLLECT INTO v_ids;
    
  OPEN :out_ids FOR SELECT COLUMN_VALUE AS id FROM TABLE(v_ids);
END;
    `;

      const bindVars = {
        names: { type: oracledb.STRING, dir: oracledb.BIND_IN, val: names },
        descs: { type: oracledb.STRING, dir: oracledb.BIND_IN, val: descs },
        periodStarts: {
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
          val: periodStarts,
        },
        periodEnds: {
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
          val: periodEnds,
        },
        tenancyId: {
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
          val: tenancyId,
        },
        out_ids: {
          type: oracledb.CURSOR,
          dir: oracledb.BIND_OUT,
          resultSet: true,
        },
      };

      const result = (await connection.execute(plsql, bindVars, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      })) as oracledb.Result<any>;

      const cursor = result.outBinds.out_ids;
      const rows = await cursor.getRows();
      await cursor.close();
      const generatedIds: number[] = rows.map((row: { ID: number }) => row.ID);

      const dayTemplateSQL = `
      INSERT INTO day_templates (name, description, timeslots, tenancy_id)
      VALUES (:name, :description, :timeslots, :tenancyId)
    `;
      const dayBindVars = {
        name,
        description,
        timeslots: JSON.stringify(generatedIds),
        tenancyId,
      };

      await connection.execute(dayTemplateSQL, dayBindVars, {
        autoCommit: false,
      });

      await connection.commit();
    } catch (err) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackErr) {
          console.error("Rollback error:", rollbackErr);
        }
      }
      console.error("Error creating day template with timeslots:", err);
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing connection:", closeErr);
        }
      }
    }
  }

  // ----------------- SUBJECT -------------------

  async createSubject(
    name: string,
    description: string,
    specialityId: ID | null,
    helperColor: string | null
  ): Promise<void> {
    const query = `INSERT INTO subjects (name, specialty_id, tenancy_id, description, helper_color) 
    VALUES (:name, :specialityId, :tenancyId, :description, :helperColor)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = [
        name,
        specialityId || null,
        tenancyId,
        description,
        helperColor,
      ];
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      throw error;
    }
  }

  async updateSubject(
    id: number,
    name: string,
    description: string,
    specialtyId: ID | null,
    helperColor: string | null
  ): Promise<void> {
    const query = `UPDATE subjects SET name = :name, description = :description, specialty_id = :specialtyId, helper_color = :helperColor WHERE id = :id AND (tenancy_id = :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = [
        name,
        description,
        specialtyId,
        helperColor,
        id,
        tenancyId,
      ];
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      console.error(`Error updating subject: ${error}`);
      throw error;
    }
  }

  // ----------------- TEACHER -------------------

  async createTeacher(
    name: string,
    email: string,
    description: string
  ): Promise<void> {
    const query = `INSERT INTO teachers (name, email, description, tenancy_id) VALUES (:name, :email, :description, :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = [name, email, description, tenancyId];
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      throw error;
    }
  }

  async updateTeacher(
    id: number,
    name: string,
    email: string,
    description: string
  ): Promise<void> {
    const query = `UPDATE teachers SET name = :name, email = :email, description = :description WHERE id = :id AND (tenancy_id = :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = [name, email, description, id, tenancyId];
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      console.error(`Error updating teacher: ${error}`);
      throw error;
    }
  }

  // ----------------- SYLLABUS -------------------

  async createSyllabus(
    classId: ID,
    subjectId: ID,
    teacherId: ID | null,
    occurrence: number,
    tenancyIdProp: ID | null = null,
    commonConn?: oracledb.Connection
  ): Promise<void> {
    const query = `INSERT INTO syllabus (class_id, subject_id, teacher_id, tenancy_id, occurrence) VALUES (:classId, :subjectId, :teacherId, :tenancyId, :occurrence)`;
    try {
      const tenancyId = tenancyIdProp || this.getTenancy();
      const bindVariables = [
        classId,
        subjectId,
        teacherId,
        tenancyId,
        occurrence,
      ];
      await this.executeCommand(query, bindVariables, commonConn);
    } catch (error) {
      throw error;
    }
  }

  async getSyllabus(classId: ID): Promise<Syllabus[]> {
    const query = `SELECT * FROM syllabus WHERE tenancy_id = :tenancyId AND class_id = :classId`;
    try {
      const tenancyId = this.getTenancy();
      const result = await this.executeQuery(query, [tenancyId, classId]);
      return result as Syllabus[];
    } catch (error) {
      console.error(`Error getting syllabus: ${error}`);
      throw error;
    }
  }

  // ----------------- LESSON -------------------

  async createLesson(lesson: LessonInput): Promise<void> {
    console.log('create lesson db', lesson);
    const query = `INSERT INTO lessons (template_id, teacher_id, classroom_id, subject_id, class_id, tenancy_id, frame_id) VALUES (:templateId, :teacherId, :classroomId, :subjectId, :classId, :tenancyId, :frameId)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = {
        templateId: lesson.timeslotId,
        teacherId: JSON.stringify(lesson.teacherId),
        classroomId: lesson.classRoomId,
        subjectId: lesson.subjectId,
        classId: lesson.classId,
        tenancyId,
        frameId: lesson.frameId,
      };
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      throw error;
    }
  }

  async getOccupiedTimeslotsByFrame(
    frameId: string,
    classRoomId: number | null | undefined
  ): Promise<OccupiedTimeslot[]> {
    const query = `
      SELECT L.*, D.SLOT_ORDER, T.PERIOD_START, T.PERIOD_END, T.NAME as TIMESLOT_NAME, C.NAME as CLASS_NAME
      FROM lessons L
      JOIN days D ON L.DAYS_ID = D.ID
      JOIN timeslots T ON L.TEMPLATE_ID = T.ID
      JOIN classes C ON L.CLASS_ID = C.ID
      WHERE L.frame_id = :frameId AND L.classroom_id = :classRoomId AND L.tenancy_id = :tenancyId
    `;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = {
        frameId,
        classRoomId,
        tenancyId,
      };
      const result = await this.executeQuery(query, bindVariables);
      return result as OccupiedTimeslot[];
    } catch (error) {
      console.error(`Error getting occupied timeslots: ${error}`);
      throw error;
    }
  }

  /**
   * Get all occupied timeslots for a teacher in a given frame.
   * This parses the TEACHERS column (stringified array) and checks for teacherId inclusion.
   */
  async getOccupiedTimeslotsByTeacher(
    frameId: string,
    teacherId: number | string
  ): Promise<any[]> {
    const query = `
      SELECT L.*, D.SLOT_ORDER, T.PERIOD_START, T.PERIOD_END, T.NAME as TIMESLOT_NAME, C.NAME as CLASS_NAME
      FROM lessons L
      JOIN days D ON L.DAYS_ID = D.ID
      JOIN timeslots T ON L.TEMPLATE_ID = T.ID
      JOIN classes C ON L.CLASS_ID = C.ID
      WHERE L.frame_id = :frameId AND L.tenancy_id = :tenancyId
    `;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = {
        frameId,
        tenancyId,
      };
      const result = await this.executeQuery(query, bindVariables);
      // Filter in JS because TEACHERS is a stringified array
      return (result as any[]).filter(lesson => {
        if (!lesson.TEACHERS) return false;
        try {
          const teachers = JSON.parse(lesson.TEACHERS);
          return Array.isArray(teachers) && teachers.includes(Number(teacherId));
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error(`Error getting occupied timeslots for teacher: ${error}`);
      throw error;
    }
  }

  /**
   * Returns classrooms that are available (not occupied) for a given frame, day index, and timeslot.
   */
  async getAvailableClassroomsByFrameAndTimeslot(
    frameId: string,
    dayIndex: number,
    timeslotId: number
  ): Promise<any[]> {
    // Find all classrooms occupied in this frame, day, and timeslot
    const occupiedQuery = `
      SELECT DISTINCT L.CLASSROOM_ID
      FROM lessons L
      JOIN days D ON L.DAYS_ID = D.ID
      WHERE L.FRAME_ID = :frameId
        AND D.SLOT_ORDER = :dayIndex
        AND L.TEMPLATE_ID = :timeslotId
        AND L.TENANCY_ID = :tenancyId
    `;
    // All classrooms for this tenancy
    const allClassroomsQuery = `
      SELECT * FROM classrooms WHERE tenancy_id = :tenancyId
    `;
    try {
      const tenancyId = this.getTenancy();
      const occupiedRows = await this.executeQuery(occupiedQuery, {
        frameId,
        dayIndex,
        timeslotId,
        tenancyId,
      });
      const occupiedIds = new Set((occupiedRows as any[]).map((row) => row.CLASSROOM_ID));
      const allClassrooms = await this.executeQuery(allClassroomsQuery, { tenancyId });
      // Filter out occupied classrooms
      return (allClassrooms as any[]).filter((room) => !occupiedIds.has(room.ID));
    } catch (error) {
      console.error(`Error getting available classrooms: ${error}`);
      throw error;
    }
  }

  /**
   * Returns teachers that are available (not occupied) for a given frame, day index, and timeslot.
   * Handles TEACHERS as a stringified array (multiple teachers per lesson).
   */
  async getAvailableTeachersByFrameAndTimeslot(
    frameId: string,
    dayIndex: number,
    timeslotId: number
  ): Promise<any[]> {
    // Find all teacher IDs occupied in this frame, day, and timeslot
    const occupiedQuery = `
      SELECT L.TEACHERS
      FROM lessons L
      JOIN days D ON L.DAYS_ID = D.ID
      WHERE L.FRAME_ID = :frameId
        AND D.SLOT_ORDER = :dayIndex
        AND L.TEMPLATE_ID = :timeslotId
        AND L.TENANCY_ID = :tenancyId
    `;
    // All teachers for this tenancy
    const allTeachersQuery = `
      SELECT * FROM teachers WHERE tenancy_id = :tenancyId
    `;
    try {
      const tenancyId = this.getTenancy();
      const occupiedRows = await this.executeQuery(occupiedQuery, {
        frameId,
        dayIndex,
        timeslotId,
        tenancyId,
      });
      // Collect all teacher IDs that are occupied (flatten all stringified arrays)
      const occupiedIds = new Set<number>();
      (occupiedRows as any[]).forEach((row) => {
        if (row.TEACHERS) {
          try {
            const ids = JSON.parse(row.TEACHERS);
            if (Array.isArray(ids)) {
              ids.forEach((id) => occupiedIds.add(Number(id)));
            }
          } catch {}
        }
      });
      const allTeachers = await this.executeQuery(allTeachersQuery, { tenancyId });
      // Filter out occupied teachers
      return (allTeachers as any[]).filter((teacher) => !occupiedIds.has(teacher.ID));
    } catch (error) {
      console.error(`Error getting available teachers: ${error}`);
      throw error;
    }
  }

  // ----------------- CLASS -------------------
  async createClass(
    name: string,
    numberOfStudents: string,
    syllabus: Record<ID, SyllabusFormProperties>
  ): Promise<void> {
    const conn = await this.pool!.getConnection();
    if (!conn) {
      throw new Error("Failed to get connection");
    }

    const queryClass = `
      INSERT INTO classes (name, number_of_students, tenancy_id)
      VALUES (:name, :numberOfStudents, :tenancyId)
      RETURNING id INTO :classId`;
    const tenancyId = this.getTenancy();
    const bindVariables = {
      name,
      numberOfStudents,
      tenancyId,
      classId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    };
    const result = (await conn.execute(queryClass, bindVariables)) as any;
    const classId = result.outBinds.classId[0];

    // syllabus
    const syllabusValues = Object.values(syllabus);
    const values: {
      subjects: number[];
      teachers: string[];
      occurrence: number[];
    } = {
      subjects: Object.keys(syllabus).map((k) => Number(k)) || [],
      teachers: [],
      occurrence: [],
    };
    syllabusValues.forEach((v) => {
      values.teachers.push(JSON.stringify(v.teachers || []));
      values.occurrence.push(v.occurrence || 0);
    });

    console.log("arrrrray::", values);

    try {
      // Only proceed with syllabus creation if there are subjects to add
      if (values.subjects.length > 0) {
        const rows = values.subjects.map((_, index) =>
          `(${classId}, ${values.subjects[index]}, '${values.teachers[index]}', ${values.occurrence[index]}, ${tenancyId})`
        ).join(",\n");

        const query = `INSERT INTO syllabus (class_id, subject_id, teachers, occurrence, tenancy_id) VALUES ${rows}`;
        
        console.log("Executing syllabus insert query:", query);
        await conn.execute(query);
      } else {
        console.log("No syllabus entries to insert");
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  // ----------------- CLASSROOM -------------------

  async createClassRoom(
    name: string,
    capacity: number,
    description: string,
    specialityId: ID | null
  ): Promise<void> {
    const query = `INSERT INTO classrooms (name, capacity, description, speciality_id, tenancy_id) VALUES (:name, :capacity, :description, :specialityId, :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = [
        name,
        capacity,
        description,
        specialityId,
        tenancyId,
      ];
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      throw error;
    }
  }

  async updateClassRoom(
    name: string,
    capacity: number,
    description: string,
    specialityId: number,
    id: number
  ): Promise<void> {
    const tenancyId = this.getTenancy();
    const query = `UPDATE classrooms SET capacity = :capacity,  name = :name, description = :description, speciality_id = :specialityId WHERE id = :id AND tenancy_id = :tenancyId`;
    const bindVariables = [
      capacity,
      name,
      description,
      specialityId,
      id,
      tenancyId,
    ];
    try {
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      throw error;
    }
  }

  private collectLessonIds(timeSlots: Array<{ timeslotId: ID; lessonId?: string }>): string[] {
    return timeSlots
      .filter(slot => slot.lessonId)
      .map(slot => slot.lessonId as string);
  }

  async createSchedule(
    frameId: number | "CUSTOM",
    description: string,
    owner: string,
    lessons: Record<string, LessonInput>,
    days: Array<{ id: string; timeSlots: Array<{ timeslotId: ID; lessonId?: string }>; templateId?: string }>,
    classId: ID,
    name: string,
  ): Promise<number> {
    const conn = await this.pool!.getConnection();
    if (!conn) {
      throw new Error("Failed to get connection");
    }

    try {
      // schedule 
      const querySchedule = `
        INSERT INTO SCHEDULE (TENANCY_ID, FRAME_ID, DESCRIPTION, OWNER, CLASS_ID, NAME)
        VALUES (:tenancyId, :frameId, :description, :owner, :classId, :name)
        RETURNING ID INTO :scheduleId
      `;
      
      const tenancyId = this.getTenancy();
      const bindVariables = {
        tenancyId,
        frameId: frameId === "CUSTOM" ? null : frameId,
        description,
        owner,
        classId,
        name,
        scheduleId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      };

      const result = await conn.execute(querySchedule, bindVariables);
      const scheduleId = (result.outBinds as any)?.scheduleId[0];

      // DAY
      let dayIDs: any = {};
      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        if (!day) continue;

        const queryDay = `
          INSERT INTO DAYS (
            TENANCY_ID, SCHEDULE_ID, 
            SLOT_ORDER, DAY_IDENTIFIER, DAY_TEMPLATE_ID
          ) VALUES (
            :tenancyId, :scheduleId, :slotOrder, :dayIdentifier, :templateId
          )
          RETURNING ID INTO :dayId
        `;

        const lessonBindVars = {
          tenancyId: Number(tenancyId),
          scheduleId: Number(scheduleId),
          slotOrder: i,
          dayIdentifier: day.id,
          templateId: day.templateId ? Number(day.templateId) : null,
          dayId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        const dayResult = await conn.execute(queryDay, lessonBindVars);
        dayIDs[day.id] = (dayResult.outBinds as any)?.dayId[0];

        const lessonsInDay = this.collectLessonIds(day.timeSlots);
      }

      // lessons
      for (const [_, lesson] of Object.entries(lessons)) {
        const day = days.find(d => d.timeSlots.some(ts => ts.timeslotId === lesson.timeslotId));
        if (!day) continue;
console.log('lesson in creation ', lesson);
        const queryLesson = `
          INSERT INTO LESSONS (
            TENANCY_ID, SCHEDULE_ID, TEMPLATE_ID, DAYS_ID, 
            SUBJECT_ID, CLASS_ID, TEACHERS, CLASSROOM_ID, FRAME_ID
          ) VALUES (
            :tenancyId, :scheduleId, :templateId, :daysId,
            :subjectId, :classId, :teachers, :classroomId, :frameId
          )
        `;

        const lessonBindVars = {
          tenancyId: Number(tenancyId),
          scheduleId: Number(scheduleId),
          templateId: Number(lesson.timeslotId),
          daysId: dayIDs[day.id],
          subjectId: Number(lesson.subjectId),
          classId: Number(lesson.classId),
          teachers: `[${JSON.stringify(lesson.teacherId)}]`,
          classroomId: Number(lesson.classRoomId),
          frameId: Number(frameId),
        };

        await conn.execute(queryLesson, lessonBindVars);
      }

      await conn.commit();
      return scheduleId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  // ----------------- FRAME -------------------

  async createFrame(
    name: string,
    recurrence: number,
    numberOfDays: number,
    description: string = ""
  ): Promise<void> {
    const query = `INSERT INTO frames (name, recurrence, number_of_days, description, tenancy_id) VALUES (:name, :recurrence, :numberOfDays, :description, :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = [
        name,
        recurrence,
        numberOfDays,
        description,
        tenancyId,
      ];
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      throw error;
    }
  }

  async updateFrame(
    name: string,
    recurrence: number,
    numberOfDays: number,
    description: string,
    id: number
  ): Promise<void> {
    const query = `UPDATE frames SET name = :name, recurrence = :recurrence, number_of_days = :numberOfDays, description = :description WHERE id = :id`;
    try {
      const bindVariables = [name, recurrence, numberOfDays, description, id];
      await this.executeCommand(query, bindVariables);
    } catch (error) {
      throw error;
    }
  }

  async getFrameById(id: number): Promise<Frame> {
    const query = `SELECT * FROM frames WHERE id = :id AND (tenancy_id = :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const result = await this.executeQuery(query, [id, tenancyId]);
      return (result as Frame[])[0];
    } catch (error) {
      console.error(`Error getting frame: ${error}`);
      throw error;
    }
  }

  async getScheduleById(scheduleId: ID) {
    const tenancyId = this.getTenancy();
    
    // Get schedule details
    const querySchedule = `
      SELECT * FROM SCHEDULE WHERE ID = :scheduleId AND TENANCY_ID = :tenancyId
    `;
    const scheduleResult = await this.executeQuery(querySchedule, [scheduleId, tenancyId]);
    if (!scheduleResult || scheduleResult.length === 0) {
      throw new Error('Schedule not found');
    }
    
    const schedule = scheduleResult[0] as any;
    
    // Get days with template IDs
    const queryDays = `
      SELECT ID, SLOT_ORDER, DAY_IDENTIFIER, DAY_TEMPLATE_ID 
      FROM DAYS 
      WHERE SCHEDULE_ID = :scheduleId AND TENANCY_ID = :tenancyId
      ORDER BY SLOT_ORDER
    `;
    const daysResult = await this.executeQuery(queryDays, [scheduleId, tenancyId]) as any[];
    
    // Get day templates for days that use them
    const dayTemplateIds = daysResult
      .filter(day => day.DAY_TEMPLATE_ID !== null)
      .map(day => day.DAY_TEMPLATE_ID);
    
    
    let templateTimeslots: Record<string, number[]> = {};
    let templateNames: Record<string, string> = {};
    
    if (dayTemplateIds.length > 0) {
      // Query the templates with their names for better UI display
      const queryTemplates = `
        SELECT ID, NAME, TIMESLOTS 
        FROM DAY_TEMPLATES 
        WHERE ID IN (${dayTemplateIds.map((_, i) => `:id${i}`).join(',')})
      `;
      
      // Create bind variables object with numbered ids
      const bindVars = dayTemplateIds.reduce((acc, id, i) => {
        acc[`id${i}`] = id;
        return acc;
      }, {} as Record<string, any>);
      
      const templatesResult = await this.executeQuery(queryTemplates, bindVars) as any[];
      
      console.log(`Retrieved ${templatesResult.length} day templates from database`, templatesResult);
      
      templatesResult.forEach(template => {
        let raw = template.TIMESLOTS;
        if (typeof raw === 'string') {
          let str = raw.trim();
          if (!str.startsWith('[')) {
            str = `[${str}]`;
          }
          try {
            templateTimeslots[template.ID] = JSON.parse(str);
            templateNames[template.ID] = template.NAME;
          } catch (e) {
            console.error(`Error parsing timeslots for template ${template.ID}:`, e, 'Raw value:', raw);
            templateTimeslots[template.ID] = [];
          }
        } else if (raw == null) {
          templateTimeslots[template.ID] = [];
          templateNames[template.ID] = template.NAME;
          console.warn(`Template ${template.ID} (${template.NAME}) has null TIMESLOTS, defaulting to []`);
        } else {
          // assuming Array
          templateTimeslots[template.ID] = [];
          templateNames[template.ID] = template.NAME;
        }
      });
    }
    
    // Get lessons
    const queryLessons = `
      SELECT L.*, D.DAY_IDENTIFIER
      FROM LESSONS L
      JOIN DAYS D ON L.DAYS_ID = D.ID
      WHERE L.SCHEDULE_ID = :scheduleId AND L.TENANCY_ID = :tenancyId
    `;
    const lessonsResult = await this.executeQuery(queryLessons, [scheduleId, tenancyId]) as any[];
    
    
    // Transform days to include timeslots and template ID
    const days = daysResult.map(day => {
      const dayObj = {
        id: day.DAY_IDENTIFIER,
        order: day.SLOT_ORDER.toString(),
        identifier: `Day ${day.SLOT_ORDER + 1}`,
        templateId: day.DAY_TEMPLATE_ID?.toString() || undefined,
        timeSlots: [] as Array<{timeslotId: number, lessonId?: string}>,
        databaseId: day.ID,
        lessons: []
      };
      
      // If day has a template, add template timeslots
      if (day.DAY_TEMPLATE_ID && templateTimeslots[day.DAY_TEMPLATE_ID]) {
        const templateId = day.DAY_TEMPLATE_ID;
        
        templateTimeslots[templateId].forEach(timeslotId => {
          dayObj.timeSlots.push({ 
            timeslotId,
            // No lessonId at this point - will be added later if there's a lesson for this timeslot
          });
        });
      } else if (day.DAY_TEMPLATE_ID) {
        console.warn(`Day ${dayObj.id} references template ${day.DAY_TEMPLATE_ID} but no timeslots were found for it`);
      }
      
      return dayObj;
    });
    
    // Add lessons to days
    lessonsResult.forEach(lesson => {
      const day = days.find(d => d.databaseId === lesson.DAYS_ID);
      if (day) {
        // Check if this timeslot already exists (from template)
        const existingSlot = day.timeSlots.find(slot => slot.timeslotId === lesson.TEMPLATE_ID);
        if (existingSlot) {
          existingSlot.lessonId = lesson.ID.toString();
          console.log(`Adding lesson ${lesson.ID} to existing timeslot ${lesson.TEMPLATE_ID} in day ${day.id}`);
        } else {
          // This timeslot wasn't part of the template, so add it with the lesson
          day.timeSlots.push({
            timeslotId: lesson.TEMPLATE_ID,
            lessonId: lesson.ID.toString()
          });
        }
      } else {
        console.warn(`Could not find day with database ID ${lesson.DAYS_ID} for lesson ${lesson.ID}`);
      }
    });
    
    return {
      id: schedule.ID.toString(),
      name: schedule.NAME,
      description: schedule.DESCRIPTION,
      owner: schedule.OWNER,
      class: schedule.CLASS_ID,
      status: schedule.STATUS || "DRAFT",
      frameId: schedule.FRAME_ID === null ? "CUSTOM" : schedule.FRAME_ID,
      days,
      lessons: lessonsResult.reduce((acc: any, lesson: any) => {
        acc[lesson.ID] = {
          id: lesson.ID.toString(),
          timeslotId: lesson.TEMPLATE_ID,
          teacherId: lesson.TEACHERS ? JSON.parse(lesson.TEACHERS)[0] : null,
          classRoomId: lesson.CLASSROOM_ID,
          subjectId: lesson.SUBJECT_ID,
          classId: lesson.CLASS_ID
        };
        return acc;
      }, {})
    };
  }

  async getSchedules() {
    const tenancyId = this.getTenancy();
    
    // Get all schedules for the tenancy
    const query = `
      SELECT s.*, c.NAME as CLASS_NAME
      FROM SCHEDULE s
      LEFT JOIN CLASSES c ON s.CLASS_ID = c.ID
      WHERE s.TENANCY_ID = :tenancyId
      ORDER BY s.ID DESC
    `;
    const schedulesResult = await this.executeQuery(query, [tenancyId]);
    return schedulesResult;
  }

  async updateSchedule(
    scheduleId: string,
    frameId: number | "CUSTOM",
    description: string,
    owner: string,
    lessons: Record<string, LessonInput>,
    days: Array<{ id: string; timeSlots: Array<{ timeslotId: ID; lessonId?: string }>; templateId?: string; databaseId?: number }>,
    classId: ID,
    name: string,
  ): Promise<void> {
    const conn = await this.pool!.getConnection();
    if (!conn) {
      throw new Error("Failed to get connection");
    }

    try {
      const tenancyId = this.getTenancy();
      
      // Update schedule
      const querySchedule = `
        UPDATE SCHEDULE 
        SET FRAME_ID = :frameId, 
            DESCRIPTION = :description, 
            OWNER = :owner,
            CLASS_ID = :classId,
            NAME = :name
        WHERE ID = :scheduleId AND TENANCY_ID = :tenancyId
      `;
      
      const bindVariables = {
        scheduleId: Number(scheduleId),
        frameId: frameId === "CUSTOM" ? null : Number(frameId),
        description,
        owner,
        classId: Number(classId),
        name,
        tenancyId
      };

      await conn.execute(querySchedule, bindVariables);
      
      // Get existing days and lessons
      const existingDaysResult = await conn.execute(
        `SELECT ID, DAY_IDENTIFIER FROM DAYS WHERE SCHEDULE_ID = :scheduleId AND TENANCY_ID = :tenancyId`,
        { scheduleId: Number(scheduleId), tenancyId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      const existingDays = (existingDaysResult.rows || []) as Array<{ ID: number, DAY_IDENTIFIER: string }>;
      const existingDayIds = new Map(existingDays.map(day => [day.DAY_IDENTIFIER, day.ID]));
      
      const existingLessonsResult = await conn.execute(
        `SELECT ID, DAYS_ID, TEMPLATE_ID, SUBJECT_ID, CLASSROOM_ID 
         FROM LESSONS 
         WHERE SCHEDULE_ID = :scheduleId AND TENANCY_ID = :tenancyId`,
        { scheduleId: Number(scheduleId), tenancyId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      const existingLessons = (existingLessonsResult.rows || []) as Array<{ 
        ID: number, 
        DAYS_ID: number,
        TEMPLATE_ID: number,
        SUBJECT_ID: number,
        CLASSROOM_ID: number
      }>;
      
      // Track days to process
      let dayIDs: Record<string, number> = {};
      const daysToCreate: Array<any> = [];
      const daysToDelete: Array<number> = [];
      const daysToUpdate: Array<{ id: number, templateId: number | null }> = [];
      
      // Process days
      console.log(`Processing ${days.length} days for update`);
      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        if (!day) continue;
        
        const existingDayId = existingDayIds.get(day.id);
        
        if (existingDayId) {
          // Update existing day
          dayIDs[day.id] = existingDayId;
          
          // Check if template ID changed
          const templateId = day.templateId ? Number(day.templateId) : null;
          
          if (templateId) {
            console.log(`Day ${day.id} uses template ID ${templateId}`);
          }
          
          daysToUpdate.push({ id: existingDayId, templateId });
        } else {
          // Create new day
          console.log(`Creating new day ${day.id} with template ID ${day.templateId || 'none'}`);
          
          daysToCreate.push({
            tenancyId: Number(tenancyId),
            scheduleId: Number(scheduleId),
            slotOrder: i,
            dayIdentifier: day.id,
            templateId: day.templateId ? Number(day.templateId) : null
          });
        }
      }
      
      // Find days to delete (exist in DB but not in incoming data)
      for (const existingDay of existingDays) {
        if (!days.find(d => d.id === existingDay.DAY_IDENTIFIER)) {
          daysToDelete.push(existingDay.ID);
        }
      }
      
      // Create new days
      for (const dayToCreate of daysToCreate) {
        const queryDay = `
          INSERT INTO DAYS (
            TENANCY_ID, SCHEDULE_ID, 
            SLOT_ORDER, DAY_IDENTIFIER, DAY_TEMPLATE_ID
          ) VALUES (
            :tenancyId, :scheduleId, :slotOrder, :dayIdentifier, :templateId
          )
          RETURNING ID INTO :dayId
        `;

        const dayBindVars = {
          ...dayToCreate,
          dayId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        const dayResult = await conn.execute(queryDay, dayBindVars);
        dayIDs[dayToCreate.dayIdentifier] = (dayResult.outBinds as any)?.dayId[0];
      }
      
      // Update existing days
      for (const dayToUpdate of daysToUpdate) {
        console.log(`Updating day ID ${dayToUpdate.id} with template ID ${dayToUpdate.templateId || 'NULL'}`);
        
        await conn.execute(
          `UPDATE DAYS SET DAY_TEMPLATE_ID = :templateId 
           WHERE ID = :id AND TENANCY_ID = :tenancyId`,
          { 
            templateId: dayToUpdate.templateId,
            id: dayToUpdate.id,
            tenancyId
          }
        );
      }
      
      // Delete removed days
      if (daysToDelete.length > 0) {
        // Delete associated lessons first
        await conn.execute(
          `DELETE FROM LESSONS 
           WHERE DAYS_ID IN (${daysToDelete.join(',')}) 
           AND TENANCY_ID = :tenancyId`,
          { tenancyId }
        );
        
        // Then delete the days
        await conn.execute(
          `DELETE FROM DAYS 
           WHERE ID IN (${daysToDelete.join(',')}) 
           AND TENANCY_ID = :tenancyId`,
          { tenancyId }
        );
      }
      
      // Process lessons
      const lessonsToCreate: Array<any> = [];
      const lessonsToUpdate: Array<any> = [];
      const existingLessonIds = new Set();
      
      for (const [lessonId, lesson] of Object.entries(lessons)) {
        const day = days.find(d => d.timeSlots.some(ts => ts.timeslotId === lesson.timeslotId));
        if (!day) continue;
        
        const dayId = dayIDs[day.id];
        if (!dayId) continue;
        
        // Check if this is an existing lesson
        const existingLesson = existingLessons.find(el => 
          String(el.ID) === lessonId && 
          el.DAYS_ID === dayId && 
          el.TEMPLATE_ID === Number(lesson.timeslotId)
        );
        
        if (existingLesson) {
          // Update existing lesson
          existingLessonIds.add(existingLesson.ID);
          
          // Check if anything changed
          if (
            existingLesson.SUBJECT_ID !== Number(lesson.subjectId) ||
            existingLesson.CLASSROOM_ID !== Number(lesson.classRoomId)
          ) {
            lessonsToUpdate.push({
              id: existingLesson.ID,
              subjectId: Number(lesson.subjectId),
              classId: Number(lesson.classId),
              teachers: JSON.stringify(this.collectLessonIds(day.timeSlots)),
              classroomId: Number(lesson.classRoomId),
              tenancyId
            });
          }
        } else {
          // Create new lesson
          lessonsToCreate.push({
            tenancyId: Number(tenancyId),
            scheduleId: Number(scheduleId),
            templateId: Number(lesson.timeslotId),
            daysId: dayId,
            subjectId: Number(lesson.subjectId),
            classId: Number(lesson.classId),
            teachers: JSON.stringify(lesson.teacherId ? [lesson.teacherId] : []),
            classroomId: Number(lesson.classRoomId),
            frameId,
          });
        }
      }
      
      // Delete lessons that no longer exist
      const lessonIdsToDelete = existingLessons
        .filter(el => !existingLessonIds.has(el.ID))
        .map(el => el.ID);
      
      if (lessonIdsToDelete.length > 0) {
        await conn.execute(
          `DELETE FROM LESSONS 
           WHERE ID IN (${lessonIdsToDelete.join(',')}) 
           AND TENANCY_ID = :tenancyId`,
          { tenancyId }
        );
      }
      
      // Create new lessons
      for (const lessonToCreate of lessonsToCreate) {
        const queryLesson = `
          INSERT INTO LESSONS (
            TENANCY_ID, SCHEDULE_ID, TEMPLATE_ID, DAYS_ID, 
            SUBJECT_ID, CLASS_ID, TEACHERS, CLASSROOM_ID, FRAME_ID
          ) VALUES (
            :tenancyId, :scheduleId, :templateId, :daysId,
            :subjectId, :classId, :teachers, :classroomId, :frameId
          )
        `;
        
        await conn.execute(queryLesson, lessonToCreate);
      }
      
      // Update existing lessons
      for (const lessonToUpdate of lessonsToUpdate) {
        await conn.execute(
          `UPDATE LESSONS 
           SET SUBJECT_ID = :subjectId, 
               CLASS_ID = :classId, 
               TEACHERS = :teachers, 
               CLASSROOM_ID = :classroomId 
           WHERE ID = :id AND TENANCY_ID = :tenancyId`,
          lessonToUpdate
        );
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  // Get all schedules for a given frame in the current tenancy
  async getSchedulesByFrame(frameId: string | number) {
    const tenancyId = this.getTenancy();
    const query = `
      SELECT * FROM SCHEDULE WHERE TENANCY_ID = :tenancyId AND FRAME_ID = :frameId
    `;
    const schedulesResult = await this.executeQuery(query, [tenancyId, frameId === "CUSTOM" ? null : Number(frameId)]);
    // For each schedule, fetch full details (days, lessons, etc.)
    const schedules = await Promise.all(
      (schedulesResult as any[]).map(async (row) => {
        return this.getScheduleById(row.ID);
      })
    );
    // Filter out nulls (in case getScheduleById fails)
    return schedules.filter(Boolean);
  }
}
