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
import {
  Classes,
  ClassRoom,
  GlobalTimeslot,
  ID,
  Lesson,
  Speciality,
  Subject,
  Syllabus,
  Teacher,
  Timeslots,
} from "@/types/databaseTypes";
import { NormalizedSyllabus } from "@/app/[locale]/(tenancy)/_actions/createClass";
import { LessonInput } from "@/types/FormActionType";

interface ExtendedExecuteOptions extends ExecuteOptions {
  bindDefs?: {
    type: any;
    dir: any;
    name: string;
  }[];
}

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
    let result: oracledb.Result<unknown>;
    let conn: oracledb.Connection;
    try {
      conn = connectionParam || (await this.getConnection());
    } catch (error) {
      console.error(`Error connecting to Oracle database: ${error}`);
      throw error;
    }
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
    params: ExtendedExecuteOptions = { outFormat: OUT_FORMAT_OBJECT }
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

  // --------------- USERS ---------------
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
      const result = (await this.executeQuery(query, bindVariables, conn)) as {
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
    const conn = await this.getConnection();
    const query = `INSERT INTO users (email, password_hash, first_name, last_name) VALUES (:email, :password, :firstname, :lastname)`;
    const bindVariables = [email, password, firstname, lastname];
    const result = await this.executeCommand(query, bindVariables);
    const tenancy = await this.createTenancy("self-tenancy", email);
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
      WHERE user_id = :id
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
      const result = (await this.executeQuery(
        query,
        bindVariables,
        conn
      )) as User[];
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

  // ----------------- TENANCIES -------------------

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

  // ----------------- SPECIALITIES ----------------------

  async createSpeciality(name: string, desc: string): Promise<void> {
    const conn = await this.getConnection();
    const tenancyId = await this.getTenancy();
    const query = `INSERT INTO specialties (specialty_name, description, tenancy_id) VALUES (:name, :description, :tenancyId)`;
    try {
      const bindVariables = [name, desc, tenancyId];
      const res = await this.executeCommand(query, bindVariables, true, conn);
    } catch (error) {
      console.error(`Error creating speciality: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  async updateSpeciality(
    name: string,
    desc: string,
    id: number
  ): Promise<void> {
    const conn = await this.getConnection();
    const tenancyId = await this.getTenancy();
    const query = `UPDATE specialties SET specialty_name = :name, description = :description WHERE specialty_id = :id AND (tenancy_id = :tenancyId OR tenancy_id IS NULL)`;
    try {
      const bindVariables = [name, desc, id, tenancyId];
      await this.executeCommand(query, bindVariables, true, conn);
    } catch (error) {
      console.error(`Error updating speciality: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  async getAllSpeciality(): Promise<Speciality[]> {
    const conn = await this.getConnection();
    const tenancyId = await this.getTenancy();
    const query = `SELECT * FROM specialties WHERE(tenancy_id = :tenancyId OR tenancy_id IS NULL)`;
    try {
      const result = await this.executeQuery(query, [tenancyId], conn);
      // console.log('spec res:::', result)
      return result as Speciality[];
    } catch (error) {
      console.error(`Error getting speciality: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  async getSpecialityById(id: number): Promise<Speciality> {
    const conn = await this.getConnection();
    const tenancyId = await this.getTenancy();
    const query = `SELECT * FROM specialties WHERE specialty_id = :id AND (tenancy_id = :tenancyId OR tenancy_id IS NULL)`;
    try {
      const result = await this.executeQuery(query, [id, tenancyId], conn);
      return (result as Speciality[])[0];
    } catch (error) {
      console.error(`Error getting speciality: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  // ----------------- SLOTS ----------------------

  async getBasicTimeSlots(global: GlobalTimeslot): Promise<Timeslots[]> {
    const conn = await this.getConnection();
    console.log("::::::::::::::::::::::::::::::", global);
    const query = `SELECT * FROM TIMESLOT_TEMPLATE WHERE GLOBAL_TEMPLATE = :global AND TENANCY_ID IS NULL`;
    try {
      const result = await this.executeQuery(query, [global], conn);
      return result as Timeslots[];
    } catch (error) {
      console.error(`Error getting timeslots: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  // ----------------- SUBJECT-TEACHER -------------------

  async createSubject(
    name: string,
    description: string,
    specialityId: ID | null
  ): Promise<void> {
    const conn = await this.getConnection();
    const query = `INSERT INTO subjects (subject_name, specialty_id, tenancy_id, description) VALUES (:name, :specialityId, :tenancyId, :description)`;
    try {
      const tenancyId = await this.getTenancy();
      const bindVariables = [
        name,
        specialityId || null,
        tenancyId,
        description,
      ];
      await this.executeCommand(query, bindVariables, true, conn);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  async createTeacher(
    name: string,
    email: string,
    description: string
  ): Promise<void> {
    const conn = await this.getConnection();
    const query = `INSERT INTO teachers (teacher_name, teacher_email, description, tenancy_id) VALUES (:name, :email, :description, :tenancyId)`;
    try {
      const tenancyId = await this.getTenancy();
      const bindVariables = [name, email, description, tenancyId];
      await this.executeCommand(query, bindVariables, false, conn);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  async deleteTeacher(teacherId: number): Promise<void> {
    const conn = await this.getConnection();
    const query = `DELETE FROM teachers WHERE teacher_id = :teacherId`;
    const bindVariables = [teacherId];
    try {
      await this.executeCommand(query, bindVariables, false, conn);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  async getAllTeachers(): Promise<Teacher[]> {
    const conn = await this.getConnection();
    const tenancyId = await this.getTenancy();
    const query = `SELECT * FROM teachers WHERE tenancy_id = :tenancyId`;
    try {
      const result = await this.executeQuery(query, [tenancyId], conn);
      return result as Teacher[];
    } catch (error) {
      console.error(`Error getting teachers: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  async getAllSubjects(): Promise<Subject[]> {
    const conn = await this.getConnection();
    const tenancyId = await this.getTenancy();
    const query = `SELECT * FROM subjects WHERE tenancy_id = :tenancyId`;
    try {
      const result = await this.executeQuery(query, [tenancyId], conn);
      return result as Subject[];
    } catch (error) {
      console.error(`Error getting subjects: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  async createSyllabus(
    classId: ID,
    subjectId: ID,
    teacherId: ID | null,
    occurrence: number,
    tenancyIdProp: ID | null = null,
    commonConn?: oracledb.Connection
  ): Promise<void> {
    const conn = commonConn || (await this.getConnection());
    const query = `INSERT INTO syllabus (class_id, subject_id, teacher_id, tenancy_id, occurrence) VALUES (:classId, :subjectId, :teacherId, :tenancyId, :occurrence)`;
    try {
      const tenancyId = tenancyIdProp || (await this.getTenancy());
      const bindVariables = [
        classId,
        subjectId,
        teacherId,
        tenancyId,
        occurrence,
      ];
      await this.executeCommand(query, bindVariables, false, conn);
      if (!commonConn) {
        await conn.commit();
      }
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      if (!commonConn) await conn.close();
    }
  }

  async getSyllabus(classId: ID): Promise<Syllabus[]> {
    const conn = await this.getConnection();
    const tenancyId = await this.getTenancy();
    const query = `SELECT * FROM syllabus WHERE tenancy_id = :tenancyId AND class_id = :classId`;
    try {
      const result = await this.executeQuery(query, [tenancyId, classId], conn);
      return result as Syllabus[];
    } catch (error) {
      console.error(`Error getting syllabus: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  // ----------------- LESSON -------------------

  async createLesson(lesson: LessonInput): Promise<void> {
    const conn = await this.getConnection();
    const query = `INSERT INTO lessons (timeslot_id, teacher_id, classroom_id, subject_id, class_id, tenancy_id) VALUES (:timeslotId, :teacherId, :classroomId, :subjectId, :classId, :tenancyId)`;
    try {
      const tenancyId = await this.getTenancy();
      const bindVariables = [
        lesson.timeslot,
        lesson.teacher,
        lesson.classId,
        lesson.day,
        lesson.classroom,
        tenancyId,
      ];
      await this.executeCommand(query, bindVariables, false, conn);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  // ----------------- CLASS-CLASSROOM -------------------
  async createClass(
    name: string,
    numberOfStudents: string,
    syllabus: NormalizedSyllabus
  ): Promise<void> {
    const conn = await this.getConnection();
    const query = `
      INSERT INTO classes (class_name, number_of_students, tenancy_id)
      VALUES (:name, :numberOfStudents, :tenancyId)
      RETURNING class_id INTO :classId`;
    try {
      const tenancyId = await this.getTenancy();
      const bindVariables = {
        name,
        numberOfStudents,
        tenancyId,
        classId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      };
      const result = await this.executeCommand(
        query,
        bindVariables,
        false,
        conn
      );
      const classId = result.outBinds.classId[0];
      if (!classId) {
        throw new Error(
          "Failed to create class, there is no ID for the newly created class"
        );
      }

      syllabus.forEach(([subjectId, occurrence, teacherId]: any[]) =>
        this.createSyllabus(
          classId,
          subjectId,
          teacherId,
          occurrence,
          tenancyId,
          conn
        )
      );

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  async getAllClasses(): Promise<Classes[]> {
    const conn = await this.getConnection();
    const query = `SELECT * FROM classes WHERE tenancy_id = :tenancyId`;
    try {
      const tenancyId = await this.getTenancy();
      const result = await this.executeQuery(query, [tenancyId], conn);
      return result as Classes[];
    } catch (error) {
      console.error(`Error getting classes: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  async deleteClass(classId: number): Promise<void> {
    const conn = await this.getConnection();
    const query = `DELETE FROM classes WHERE class_id = :classId`;
    const bindVariables = [classId];
    try {
      await this.executeCommand(query, bindVariables, false, conn);
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
    specialityId: ID | null
  ): Promise<void> {
    const conn = await this.getConnection();
    const query = `INSERT INTO classrooms (classroom_name, capacity, speciality_id, tenancy_id) VALUES (:name, :capacity, :specialityId, :tenancyId)`;
    try {
      const tenancyId = await this.getTenancy();
      const bindVariables = [name, capacity, specialityId, tenancyId];
      await this.executeCommand(query, bindVariables, false, conn);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  async getAllClassRooms(): Promise<ClassRoom[]> {
    const conn = await this.getConnection();
    const query = `SELECT * FROM classrooms WHERE tenancy_id = :tenancyId`;
    try {
      const tenancyId = await this.getTenancy();
      const result = await this.executeQuery(query, [tenancyId], conn);
      return result as ClassRoom[];
    } catch (error) {
      console.error(`Error getting class rooms: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  async getClassRoomById(id: number): Promise<ClassRoom> {
    const conn = await this.getConnection();
    const query = `SELECT * FROM classrooms WHERE classroom_id = :id AND tenancy_id = :tenancyId`;
    try {
      const tenancyId = await this.getTenancy();
      const result = await this.executeQuery(query, [id, tenancyId], conn);
      return (result as ClassRoom[])[0];
    } catch (error) {
      console.error(`Error getting class room: ${error}`);
      throw error;
    } finally {
      await conn.close();
    }
  }

  async deleteClassRoom(id: number): Promise<void> {
    const conn = await this.getConnection();
    const query = `DELETE FROM classrooms WHERE classroom_id = :id`;
    const bindVariables = [id];
    try {
      await this.executeCommand(query, bindVariables, false, conn);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }

  async updateClassRoom(
    name: string,
    capacity: number,
    specialityId: number,
    id: number
  ): Promise<void> {
    const conn = await this.getConnection();
    const tenancyId = await this.getTenancy();
    const query = `UPDATE classrooms SET capacity = :capacity,  classroom_name = :name, speciality_id = :specialityId WHERE classroom_id = :id AND tenancy_id = :tenancyId`;
    const bindVariables = [capacity, name, specialityId, id, tenancyId];
    try {
      await this.executeCommand(query, bindVariables, false, conn);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      await conn.close();
    }
  }
}

export default DatabaseService;
