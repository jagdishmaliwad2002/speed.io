import { db } from "./db";
import {
  testResults,
  type TestResult,
  type InsertTestResult
} from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getTestResults(): Promise<TestResult[]>;
  createTestResult(result: InsertTestResult): Promise<TestResult>;
}

export class DatabaseStorage implements IStorage {
  async getTestResults(): Promise<TestResult[]> {
    return await db.select()
      .from(testResults)
      .orderBy(desc(testResults.createdAt))
      .limit(50); // Limit to last 50 results
  }

  async createTestResult(insertResult: InsertTestResult): Promise<TestResult> {
    const [result] = await db.insert(testResults)
      .values(insertResult)
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
