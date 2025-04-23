import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage-impl";
import { setupAuth } from "./auth";
import {
  insertUserSchema,
  insertStudentSchema,
  insertBusSchema,
  insertBusRoundSchema,
  insertRoundStudentSchema,
  insertLocationSchema,
  insertNotificationSchema,
  insertAbsenceSchema,
  insertActivityLogSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  const { requireAuth } = setupAuth(app);

  // User routes (Parent & Driver management)
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const { role } = req.query;
      const users = await storage.getUsers(role as string);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);

      // Log activity
      await storage.logActivity({
        action: "CREATE_USER",
        details: { userId: user.id, role: user.role },
        userId: req.user?.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);

      // Log activity
      await storage.logActivity({
        action: "UPDATE_USER",
        details: { userId: id },
        userId: req.user?.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.sendStatus(204);

      // Log activity
      await storage.logActivity({
        action: "DELETE_USER",
        details: { userId: id },
        userId: req.user?.id,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Student routes
  app.get("/api/students", requireAuth, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", requireAuth, async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);

      // Log activity
      await storage.logActivity({
        action: "CREATE_STUDENT",
        details: { studentId: student.id },
        userId: req.user?.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid student data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.updateStudent(id, studentData);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);

      // Log activity
      await storage.logActivity({
        action: "UPDATE_STUDENT",
        details: { studentId: id },
        userId: req.user?.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid student data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStudent(id);
      res.sendStatus(204);

      // Log activity
      await storage.logActivity({
        action: "DELETE_STUDENT",
        details: { studentId: id },
        userId: req.user?.id,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Bus routes
  app.get("/api/buses", requireAuth, async (req, res) => {
    try {
      const buses = await storage.getBuses();
      res.json(buses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch buses" });
    }
  });

  app.get("/api/buses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bus = await storage.getBus(id);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      res.json(bus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bus" });
    }
  });

  app.post("/api/buses", requireAuth, async (req, res) => {
    try {
      const busData = insertBusSchema.parse(req.body);
      const bus = await storage.createBus(busData);
      res.status(201).json(bus);

      // Log activity
      await storage.logActivity({
        action: "CREATE_BUS",
        details: { busId: bus.id },
        userId: req.user?.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bus data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bus" });
    }
  });

  app.put("/api/buses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const busData = insertBusSchema.parse(req.body);
      const bus = await storage.updateBus(id, busData);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      res.json(bus);

      // Log activity
      await storage.logActivity({
        action: "UPDATE_BUS",
        details: { busId: id },
        userId: req.user?.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bus data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bus" });
    }
  });

  app.delete("/api/buses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBus(id);
      res.sendStatus(204);

      // Log activity
      await storage.logActivity({
        action: "DELETE_BUS",
        details: { busId: id },
        userId: req.user?.id,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bus" });
    }
  });

  // Bus Round routes
  app.get("/api/bus-rounds", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const rounds = await storage.getBusRounds(status as string);
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bus rounds" });
    }
  });

  app.get("/api/bus-rounds/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const round = await storage.getBusRound(id);
      if (!round) {
        return res.status(404).json({ message: "Bus round not found" });
      }
      res.json(round);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bus round" });
    }
  });

  app.post("/api/bus-rounds", requireAuth, async (req, res) => {
    try {
      const roundData = insertBusRoundSchema.parse(req.body);
      const round = await storage.createBusRound(roundData);
      res.status(201).json(round);

      // Log activity
      await storage.logActivity({
        action: "CREATE_BUS_ROUND",
        details: { roundId: round.id },
        userId: req.user?.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid round data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bus round" });
    }
  });

  app.put("/api/bus-rounds/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const roundData = insertBusRoundSchema.parse(req.body);
      const round = await storage.updateBusRound(id, roundData);
      if (!round) {
        return res.status(404).json({ message: "Bus round not found" });
      }
      res.json(round);

      // Log activity
      await storage.logActivity({
        action: "UPDATE_BUS_ROUND",
        details: { roundId: id },
        userId: req.user?.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid round data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bus round" });
    }
  });

  app.delete("/api/bus-rounds/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBusRound(id);
      res.sendStatus(204);

      // Log activity
      await storage.logActivity({
        action: "DELETE_BUS_ROUND",
        details: { roundId: id },
        userId: req.user?.id,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bus round" });
    }
  });

  // Round students assignment
  app.get("/api/bus-rounds/:roundId/students", requireAuth, async (req, res) => {
    try {
      const roundId = parseInt(req.params.roundId);
      const students = await storage.getRoundStudents(roundId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch round students" });
    }
  });

  app.post("/api/bus-rounds/:roundId/students", requireAuth, async (req, res) => {
    try {
      const roundId = parseInt(req.params.roundId);
      const { studentId, order } = req.body;
      
      const assignment = await storage.assignStudentToRound({
        roundId,
        studentId,
        order,
      });
      
      res.status(201).json(assignment);

      // Log activity
      await storage.logActivity({
        action: "ASSIGN_STUDENT_TO_ROUND",
        details: { roundId, studentId },
        userId: req.user?.id,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign student to round" });
    }
  });

  app.delete("/api/bus-rounds/:roundId/students/:studentId", requireAuth, async (req, res) => {
    try {
      const roundId = parseInt(req.params.roundId);
      const studentId = parseInt(req.params.studentId);
      
      await storage.removeStudentFromRound(roundId, studentId);
      res.sendStatus(204);

      // Log activity
      await storage.logActivity({
        action: "REMOVE_STUDENT_FROM_ROUND",
        details: { roundId, studentId },
        userId: req.user?.id,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove student from round" });
    }
  });

  // Bus location updates
  app.post("/api/locations", requireAuth, async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.recordLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record location" });
    }
  });

  app.get("/api/buses/:busId/locations", requireAuth, async (req, res) => {
    try {
      const busId = parseInt(req.params.busId);
      const location = await storage.getLatestBusLocation(busId);
      if (!location) {
        return res.status(404).json({ message: "No location data found for bus" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bus location" });
    }
  });

  // Round control (start/stop)
  app.post("/api/bus-rounds/:id/start", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const round = await storage.updateBusRound(id, { status: "in_progress" });
      
      if (!round) {
        return res.status(404).json({ message: "Bus round not found" });
      }
      
      res.json(round);

      // Create notification
      await storage.createNotification({
        type: "round_started",
        message: `${round.name} has started`,
        roundId: id,
        busId: round.busId,
        senderId: req.user?.id,
      });

      // Log activity
      await storage.logActivity({
        action: "START_BUS_ROUND",
        details: { roundId: id },
        userId: req.user?.id,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to start bus round" });
    }
  });

  app.post("/api/bus-rounds/:id/stop", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const round = await storage.updateBusRound(id, { status: "completed" });
      
      if (!round) {
        return res.status(404).json({ message: "Bus round not found" });
      }
      
      res.json(round);

      // Create notification
      await storage.createNotification({
        type: "round_completed",
        message: `${round.name} has been completed`,
        roundId: id,
        busId: round.busId,
        senderId: req.user?.id,
      });

      // Log activity
      await storage.logActivity({
        action: "STOP_BUS_ROUND",
        details: { roundId: id },
        userId: req.user?.id,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to stop bus round" });
    }
  });

  // Notifications
  app.post("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);

      // Log activity
      await storage.logActivity({
        action: "SEND_NOTIFICATION",
        details: { notificationId: notification.id },
        userId: req.user?.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Absences
  app.post("/api/absences", requireAuth, async (req, res) => {
    try {
      const absenceData = insertAbsenceSchema.parse(req.body);
      const absence = await storage.recordAbsence(absenceData);
      res.status(201).json(absence);

      // Log activity
      await storage.logActivity({
        action: "RECORD_ABSENCE",
        details: { absenceId: absence.id, studentId: absence.studentId },
        userId: req.user?.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid absence data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record absence" });
    }
  });

  app.get("/api/absences", requireAuth, async (req, res) => {
    try {
      const { studentId, date } = req.query;
      const absences = await storage.getAbsences(
        studentId ? parseInt(studentId as string) : undefined,
        date as string
      );
      res.json(absences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch absences" });
    }
  });

  // Activity logs
  app.get("/api/activity-logs", requireAuth, async (req, res) => {
    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
