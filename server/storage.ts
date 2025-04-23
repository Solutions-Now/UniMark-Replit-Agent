import { 
  User, InsertUser, 
  Student, InsertStudent,
  Bus, InsertBus,
  BusRound, InsertBusRound,
  RoundStudent, InsertRoundStudent,
  Location, InsertLocation,
  Notification, InsertNotification,
  Absence, InsertAbsence,
  ActivityLog, InsertActivityLog
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Auth & User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  getUsers(role?: string): Promise<User[]>;

  // Student Management
  getStudent(id: number): Promise<Student | undefined>;
  getStudents(parentId?: number): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<void>;

  // Bus Management
  getBus(id: number): Promise<Bus | undefined>;
  getBuses(): Promise<Bus[]>;
  createBus(bus: InsertBus): Promise<Bus>;
  updateBus(id: number, bus: Partial<InsertBus>): Promise<Bus | undefined>;
  deleteBus(id: number): Promise<void>;

  // Bus Round Management
  getBusRound(id: number): Promise<BusRound | undefined>;
  getBusRounds(status?: string): Promise<BusRound[]>;
  createBusRound(round: InsertBusRound): Promise<BusRound>;
  updateBusRound(id: number, round: Partial<InsertBusRound>): Promise<BusRound | undefined>;
  deleteBusRound(id: number): Promise<void>;

  // Round Students
  getRoundStudents(roundId: number): Promise<RoundStudent[]>;
  assignStudentToRound(assignment: InsertRoundStudent): Promise<RoundStudent>;
  removeStudentFromRound(roundId: number, studentId: number): Promise<void>;

  // Location Tracking
  recordLocation(location: InsertLocation): Promise<Location>;
  getLatestBusLocation(busId: number): Promise<Location | undefined>;

  // Notifications
  createNotification(notification: Partial<InsertNotification>): Promise<Notification>;
  getNotifications(recipientId?: number): Promise<Notification[]>;

  // Absences
  recordAbsence(absence: InsertAbsence): Promise<Absence>;
  getAbsences(studentId?: number, date?: string): Promise<Absence[]>;

  // Activity Logs
  logActivity(log: Partial<InsertActivityLog>): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;

  // Dashboard
  getDashboardStats(): Promise<any>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private buses: Map<number, Bus>;
  private busRounds: Map<number, BusRound>;
  private roundStudents: Map<number, RoundStudent>;
  private locations: Map<number, Location>;
  private notifications: Map<number, Notification>;
  private absences: Map<number, Absence>;
  private activityLogs: Map<number, ActivityLog>;
  
  currentUserId: number;
  currentStudentId: number;
  currentBusId: number;
  currentBusRoundId: number;
  currentRoundStudentId: number;
  currentLocationId: number;
  currentNotificationId: number;
  currentAbsenceId: number;
  currentActivityLogId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.buses = new Map();
    this.busRounds = new Map();
    this.roundStudents = new Map();
    this.locations = new Map();
    this.notifications = new Map();
    this.absences = new Map();
    this.activityLogs = new Map();
    
    this.currentUserId = 1;
    this.currentStudentId = 1;
    this.currentBusId = 1;
    this.currentBusRoundId = 1;
    this.currentRoundStudentId = 1;
    this.currentLocationId = 1;
    this.currentNotificationId = 1;
    this.currentAbsenceId = 1;
    this.currentActivityLogId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h, clear expired sessions
    });
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$zZTDCB2r5NsE2CUDxdzmYe.ZP0lQRNuEo2hiYj2NiNB9Jw1N.hNgy", // "password"
      email: "admin@school.edu",
      fullName: "School Administrator",
      role: "admin",
      phone: "555-123-4567"
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async getUsers(role?: string): Promise<User[]> {
    const users = Array.from(this.users.values());
    if (role) {
      return users.filter(user => user.role === role);
    }
    return users;
  }

  // Student Management
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudents(parentId?: number): Promise<Student[]> {
    const students = Array.from(this.students.values());
    if (parentId) {
      return students.filter(student => student.parentId === parentId);
    }
    return students;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const now = new Date();
    const student: Student = { ...insertStudent, id, createdAt: now };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const existingStudent = this.students.get(id);
    if (!existingStudent) {
      return undefined;
    }
    
    const updatedStudent = { ...existingStudent, ...studentData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<void> {
    this.students.delete(id);
  }

  // Bus Management
  async getBus(id: number): Promise<Bus | undefined> {
    return this.buses.get(id);
  }

  async getBuses(): Promise<Bus[]> {
    return Array.from(this.buses.values());
  }

  async createBus(insertBus: InsertBus): Promise<Bus> {
    const id = this.currentBusId++;
    const now = new Date();
    const bus: Bus = { ...insertBus, id, createdAt: now };
    this.buses.set(id, bus);
    return bus;
  }

  async updateBus(id: number, busData: Partial<InsertBus>): Promise<Bus | undefined> {
    const existingBus = this.buses.get(id);
    if (!existingBus) {
      return undefined;
    }
    
    const updatedBus = { ...existingBus, ...busData };
    this.buses.set(id, updatedBus);
    return updatedBus;
  }

  async deleteBus(id: number): Promise<void> {
    this.buses.delete(id);
  }

  // Bus Round Management
  async getBusRound(id: number): Promise<BusRound | undefined> {
    return this.busRounds.get(id);
  }

  async getBusRounds(status?: string): Promise<BusRound[]> {
    const rounds = Array.from(this.busRounds.values());
    if (status) {
      return rounds.filter(round => round.status === status);
    }
    return rounds;
  }

  async createBusRound(insertRound: InsertBusRound): Promise<BusRound> {
    const id = this.currentBusRoundId++;
    const now = new Date();
    const round: BusRound = { ...insertRound, id, createdAt: now };
    this.busRounds.set(id, round);
    return round;
  }

  async updateBusRound(id: number, roundData: Partial<InsertBusRound>): Promise<BusRound | undefined> {
    const existingRound = this.busRounds.get(id);
    if (!existingRound) {
      return undefined;
    }
    
    const updatedRound = { ...existingRound, ...roundData };
    this.busRounds.set(id, updatedRound);
    return updatedRound;
  }

  async deleteBusRound(id: number): Promise<void> {
    this.busRounds.delete(id);
  }

  // Round Students
  async getRoundStudents(roundId: number): Promise<RoundStudent[]> {
    const assignments = Array.from(this.roundStudents.values());
    return assignments.filter(assignment => assignment.roundId === roundId);
  }

  async assignStudentToRound(insertAssignment: InsertRoundStudent): Promise<RoundStudent> {
    const id = this.currentRoundStudentId++;
    const now = new Date();
    const assignment: RoundStudent = { ...insertAssignment, id, createdAt: now };
    this.roundStudents.set(id, assignment);
    return assignment;
  }

  async removeStudentFromRound(roundId: number, studentId: number): Promise<void> {
    const assignments = Array.from(this.roundStudents.entries());
    for (const [id, assignment] of assignments) {
      if (assignment.roundId === roundId && assignment.studentId === studentId) {
        this.roundStudents.delete(id);
        break;
      }
    }
  }

  // Location Tracking
  async recordLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const now = new Date();
    const location: Location = { ...insertLocation, id, timestamp: now };
    this.locations.set(id, location);
    return location;
  }

  async getLatestBusLocation(busId: number): Promise<Location | undefined> {
    const busLocations = Array.from(this.locations.values())
      .filter(location => location.busId === busId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return busLocations.length > 0 ? busLocations[0] : undefined;
  }

  // Notifications
  async createNotification(insertNotification: Partial<InsertNotification>): Promise<Notification> {
    const id = this.currentNotificationId++;
    const now = new Date();
    const notification: Notification = { 
      id, 
      type: insertNotification.type || "general",
      message: insertNotification.message || "",
      roundId: insertNotification.roundId,
      busId: insertNotification.busId,
      studentId: insertNotification.studentId,
      senderId: insertNotification.senderId,
      recipientId: insertNotification.recipientId,
      timestamp: now 
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotifications(recipientId?: number): Promise<Notification[]> {
    const notifications = Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (recipientId) {
      return notifications.filter(notification => notification.recipientId === recipientId);
    }
    
    return notifications;
  }

  // Absences
  async recordAbsence(insertAbsence: InsertAbsence): Promise<Absence> {
    const id = this.currentAbsenceId++;
    const now = new Date();
    const absence: Absence = { ...insertAbsence, id, createdAt: now };
    this.absences.set(id, absence);
    return absence;
  }

  async getAbsences(studentId?: number, date?: string): Promise<Absence[]> {
    let absences = Array.from(this.absences.values());
    
    if (studentId) {
      absences = absences.filter(absence => absence.studentId === studentId);
    }
    
    if (date) {
      absences = absences.filter(absence => absence.date === date);
    }
    
    return absences;
  }

  // Activity Logs
  async logActivity(insertLog: Partial<InsertActivityLog>): Promise<ActivityLog> {
    const id = this.currentActivityLogId++;
    const now = new Date();
    const log: ActivityLog = {
      id,
      action: insertLog.action || "UNKNOWN_ACTION",
      details: insertLog.details || {},
      userId: insertLog.userId,
      timestamp: now
    };
    this.activityLogs.set(id, log);
    return log;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    const totalStudents = this.students.size;
    const totalParents = Array.from(this.users.values()).filter(user => user.role === "parent").length;
    const totalDrivers = Array.from(this.users.values()).filter(user => user.role === "driver").length;
    const activeRounds = Array.from(this.busRounds.values()).filter(round => round.status === "in_progress").length;
    const totalBuses = this.buses.size;
    const recentNotifications = Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
    
    return {
      totalStudents,
      totalParents,
      totalDrivers,
      totalBuses,
      activeRounds,
      recentNotifications
    };
  }
}

// Initialize and export storage instance
export const storage = new MemStorage();
