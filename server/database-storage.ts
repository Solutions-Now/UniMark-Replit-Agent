import { 
  User, InsertUser, 
  Student, InsertStudent,
  Bus, InsertBus,
  BusRound, InsertBusRound,
  RoundStudent, InsertRoundStudent,
  Location, InsertLocation,
  Notification, InsertNotification,
  Absence, InsertAbsence,
  ActivityLog, InsertActivityLog,
  users, students, buses, busRounds, roundStudents, locations, notifications, absences, activityLogs
} from "@shared/schema";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsers(role?: string): Promise<User[]> {
    if (role) {
      return db.select().from(users).where(eq(users.role, role));
    }
    return db.select().from(users);
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudents(parentId?: number): Promise<Student[]> {
    if (parentId) {
      return db.select().from(students).where(eq(students.parentId, parentId));
    }
    return db.select().from(students);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return student;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set(studentData)
      .where(eq(students.id, id))
      .returning();
    return student || undefined;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async getBus(id: number): Promise<Bus | undefined> {
    const [bus] = await db.select().from(buses).where(eq(buses.id, id));
    return bus || undefined;
  }

  async getBuses(): Promise<Bus[]> {
    return db.select().from(buses);
  }

  async createBus(insertBus: InsertBus): Promise<Bus> {
    const [bus] = await db
      .insert(buses)
      .values(insertBus)
      .returning();
    return bus;
  }

  async updateBus(id: number, busData: Partial<InsertBus>): Promise<Bus | undefined> {
    const [bus] = await db
      .update(buses)
      .set(busData)
      .where(eq(buses.id, id))
      .returning();
    return bus || undefined;
  }

  async deleteBus(id: number): Promise<void> {
    await db.delete(buses).where(eq(buses.id, id));
  }

  async getBusRound(id: number): Promise<BusRound | undefined> {
    const [round] = await db.select().from(busRounds).where(eq(busRounds.id, id));
    return round || undefined;
  }

  async getBusRounds(status?: string): Promise<BusRound[]> {
    if (status) {
      return db.select().from(busRounds).where(eq(busRounds.status, status));
    }
    return db.select().from(busRounds);
  }

  async createBusRound(insertRound: InsertBusRound): Promise<BusRound> {
    const [round] = await db
      .insert(busRounds)
      .values(insertRound)
      .returning();
    return round;
  }

  async updateBusRound(id: number, roundData: Partial<InsertBusRound>): Promise<BusRound | undefined> {
    const [round] = await db
      .update(busRounds)
      .set(roundData)
      .where(eq(busRounds.id, id))
      .returning();
    return round || undefined;
  }

  async deleteBusRound(id: number): Promise<void> {
    await db.delete(busRounds).where(eq(busRounds.id, id));
  }

  async getRoundStudents(roundId: number): Promise<RoundStudent[]> {
    return db.select().from(roundStudents).where(eq(roundStudents.roundId, roundId));
  }

  async assignStudentToRound(insertAssignment: InsertRoundStudent): Promise<RoundStudent> {
    const [assignment] = await db
      .insert(roundStudents)
      .values(insertAssignment)
      .returning();
    return assignment;
  }

  async removeStudentFromRound(roundId: number, studentId: number): Promise<void> {
    await db.delete(roundStudents).where(
      and(
        eq(roundStudents.roundId, roundId),
        eq(roundStudents.studentId, studentId)
      )
    );
  }

  async recordLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values(insertLocation)
      .returning();
    return location;
  }

  async getLatestBusLocation(busId: number): Promise<Location | undefined> {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.busId, busId))
      .orderBy(desc(locations.timestamp))
      .limit(1);
    return location || undefined;
  }

  async createNotification(insertNotification: Partial<InsertNotification>): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification as InsertNotification)
      .returning();
    return notification;
  }

  async getNotifications(recipientId?: number): Promise<Notification[]> {
    if (recipientId) {
      return db
        .select()
        .from(notifications)
        .where(eq(notifications.recipientId, recipientId))
        .orderBy(desc(notifications.timestamp));
    }
    return db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.timestamp));
  }

  async recordAbsence(insertAbsence: InsertAbsence): Promise<Absence> {
    const [absence] = await db
      .insert(absences)
      .values(insertAbsence)
      .returning();
    return absence;
  }

  async getAbsences(studentId?: number, date?: string): Promise<Absence[]> {
    if (studentId && date) {
      return db
        .select()
        .from(absences)
        .where(
          and(
            eq(absences.studentId, studentId),
            eq(absences.date, date)
          )
        );
    } else if (studentId) {
      return db
        .select()
        .from(absences)
        .where(eq(absences.studentId, studentId));
    } else if (date) {
      return db
        .select()
        .from(absences)
        .where(eq(absences.date, date));
    }
    return db.select().from(absences);
  }

  async logActivity(insertLog: Partial<InsertActivityLog>): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(insertLog as InsertActivityLog)
      .returning();
    return log;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp));
  }

  async getDashboardStats(): Promise<any> {
    const studentsResult = await db.select().from(students);
    const parentsResult = await db.select().from(users).where(eq(users.role, 'parent'));
    const driversResult = await db.select().from(users).where(eq(users.role, 'driver'));
    const busesResult = await db.select().from(buses);
    const activeRoundsResult = await db.select().from(busRounds).where(eq(busRounds.status, 'in_progress'));
    const recentNotifications = await db.select().from(notifications).orderBy(desc(notifications.timestamp)).limit(5);
    
    return {
      totalStudents: studentsResult.length,
      totalParents: parentsResult.length,
      totalDrivers: driversResult.length,
      totalBuses: busesResult.length,
      activeRounds: activeRoundsResult.length,
      recentNotifications
    };
  }
}