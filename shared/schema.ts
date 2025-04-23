import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schemas (Admin, Parent, Driver)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("admin"), // admin, parent, driver
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Student schema
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  grade: text("grade").notNull(),
  parentId: integer("parent_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Bus schema
export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  busNumber: text("bus_number").notNull().unique(),
  licenseNumber: text("license_number").notNull(),
  capacity: integer("capacity").notNull(),
  driverId: integer("driver_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBusSchema = createInsertSchema(buses).omit({
  id: true,
  createdAt: true,
});

export type InsertBus = z.infer<typeof insertBusSchema>;
export type Bus = typeof buses.$inferSelect;

// Bus Round schema
export const busRounds = pgTable("bus_rounds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // morning, afternoon
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  busId: integer("bus_id").references(() => buses.id),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBusRoundSchema = createInsertSchema(busRounds).omit({
  id: true,
  createdAt: true,
});

export type InsertBusRound = z.infer<typeof insertBusRoundSchema>;
export type BusRound = typeof busRounds.$inferSelect;

// Student-Round assignment
export const roundStudents = pgTable("round_students", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").references(() => busRounds.id),
  studentId: integer("student_id").references(() => students.id),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRoundStudentSchema = createInsertSchema(roundStudents).omit({
  id: true,
  createdAt: true,
});

export type InsertRoundStudent = z.infer<typeof insertRoundStudentSchema>;
export type RoundStudent = typeof roundStudents.$inferSelect;

// Location tracking
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").references(() => buses.id),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  timestamp: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // arrival, pickup, dropoff, etc.
  message: text("message").notNull(),
  roundId: integer("round_id").references(() => busRounds.id),
  busId: integer("bus_id").references(() => buses.id),
  studentId: integer("student_id").references(() => students.id),
  senderId: integer("sender_id").references(() => users.id),
  recipientId: integer("recipient_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  timestamp: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Student absences
export const absences = pgTable("absences", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  date: text("date").notNull(),
  reason: text("reason"),
  reportedBy: integer("reported_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAbsenceSchema = createInsertSchema(absences).omit({
  id: true,
  createdAt: true,
});

export type InsertAbsence = z.infer<typeof insertAbsenceSchema>;
export type Absence = typeof absences.$inferSelect;

// Activity logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  details: json("details"),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
