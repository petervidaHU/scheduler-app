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
  GlobalTimeslot,
  ID,
  Syllabus,
  Timeslots,
  Frame,
} from "@/types/databaseTypes";
import { NormalizedSyllabus } from "@/app/[locale]/(tenancy)/_actions/createClass";
import { LessonInput } from "@/types/FormActionType";
import { Entities } from "@/types/Entities";
import { labelMapper } from "../hooks/labelMapperForTenancyBasedData";
import { SyllabusForm, SyllabusFormProperties } from "@/types/ScheduleTypes";

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
    bindVariables: BindParameters,
    params: ExecuteOptions = { outFormat: OUT_FORMAT_OBJECT }
  ): Promise<unknown[]> {
    let result: oracledb.Result<unknown>;

    const conn = await oracledb.getConnection();
    if (!conn) throw new Error("No connection available");
    try {
      result = await conn!.execute(query, bindVariables, params);
    } catch (error) {
      console.error(`Error executing ${query} query: ${error}`);
      throw error;
    } finally {
      conn.release();
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
    const query = `INSERT INTO lessons (template_id, teacher_id, classroom_id, subject_id, class_id, tenancy_id) VALUES (:templateId, :teacherId, :classroomId, :subjectId, :classId, :tenancyId)`;
    try {
      const tenancyId = this.getTenancy();
      const bindVariables = {
        templateId: lesson.timeslot,
        teacherId: lesson.teacher,
        classroomId: lesson.classRoom,
        subjectId: lesson.subject,
        classId: lesson.classId,
        tenancyId,
      };
      await this.executeCommand(query, bindVariables);
    } catch (error) {
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

    const rows = values.subjects.map((_, index) =>
      `(${classId}, ${values.subjects[index]}, '${values.teachers[index]}', ${values.occurrence[index]}, ${tenancyId})`
    ).join(",\n");

    const query = `INSERT INTO syllabus (class_id, subject_id, teachers, occurrence, tenancy_id) VALUES ${rows}`;

    try {
      await conn.execute(query);
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
    days: Array<{ id: string; timeSlots: Array<{ timeslotId: ID; lessonId?: string }> }>,
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
      const scheduleId = result.outBinds.scheduleId[0];

      // DAY
      let dayIDs: any = {};
      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        if (!day) continue;

        const queryDay = `
          INSERT INTO DAYS (
            TENANCY_ID, SCHEDULE_ID, 
            SLOT_ORDER, DAY_IDENTIFIER
          ) VALUES (
            :tenancyId, :scheduleId, :slotOrder, :dayIdentifier
          )
          RETURNING ID INTO :dayId
        `;

        const lessonBindVars = {
          tenancyId: Number(tenancyId),
          scheduleId: Number(scheduleId),
          slotOrder: i,
          dayIdentifier: day.id,
          dayId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        const result = await conn.execute(queryDay, lessonBindVars);
        dayIDs[day.id] = result.outBinds?.dayId[0];

        const lessonsInDay = this.collectLessonIds(day.timeSlots);
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++lessonsInDay", lessonsInDay);


      }

      // lessons
      for (const [_, lesson] of Object.entries(lessons)) {
        const day = days.find(d => d.timeSlots.some(ts => ts.timeslotId === lesson.timeslot));
        if (!day) continue;

        const queryLesson = `
          INSERT INTO LESSONS (
            TENANCY_ID, SCHEDULE_ID, TEMPLATE_ID, DAYS_ID, 
            SUBJECT_ID, CLASS_ID, TEACHERS, CLASSROOM_ID
          ) VALUES (
            :tenancyId, :scheduleId, :templateId, :daysId,
            :subjectId, :classId, :teachers, :classroomId
          )
        `;

        const lessonBindVars = {
          tenancyId: Number(tenancyId),
          scheduleId: Number(scheduleId),
          templateId: Number(lesson.timeslot),
          daysId: dayIDs[day.id],
          subjectId: Number(lesson.subject),
          classId: Number(lesson.classId),
          teachers: JSON.stringify(this.collectLessonIds(day.timeSlots)),
          classroomId: Number(lesson.classRoom)
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
}
