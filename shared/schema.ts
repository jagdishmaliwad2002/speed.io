import { pgTable, text, serial, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  downloadSpeed: real("download_speed").notNull(), // in Mbps
  uploadSpeed: real("upload_speed").notNull(),     // in Mbps
  ping: integer("ping").notNull(),                 // in ms
  jitter: integer("jitter").notNull(),             // in ms
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({ 
  id: true, 
  createdAt: true 
});

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
