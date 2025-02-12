import { IStorage } from "./types";
import {
  User,
  Question,
  Answer,
  Comment,
  InsertUser,
  InsertQuestion,
  InsertAnswer,
  InsertComment,
  users,
  questions,
  answers,
  comments,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getQuestions(): Promise<Question[]> {
    return await db.select().from(questions).orderBy(questions.createdAt);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id));
    return result[0];
  }

  async createQuestion(
    insertQuestion: InsertQuestion,
    authorId: number,
  ): Promise<Question> {
    const result = await db
      .insert(questions)
      .values({ ...insertQuestion, authorId })
      .returning();
    return result[0];
  }

  async getAnswers(questionId: number): Promise<Answer[]> {
    return await db
      .select()
      .from(answers)
      .where(eq(answers.questionId, questionId))
      .orderBy(answers.createdAt);
  }

  async createAnswer(
    insertAnswer: InsertAnswer,
    questionId: number,
    authorId: number,
  ): Promise<Answer> {
    const result = await db
      .insert(answers)
      .values({ ...insertAnswer, questionId, authorId })
      .returning();
    return result[0];
  }

  async getComments(
    questionId?: number,
    answerId?: number,
  ): Promise<Comment[]> {
    let query = db.select().from(comments);
    if (questionId !== undefined) {
      query = query.where(eq(comments.questionId, questionId));
    }
    if (answerId !== undefined) {
      query = query.where(eq(comments.answerId, answerId));
    }
    const result = await query.orderBy(comments.createdAt);
    return result;
  }

  async createComment(
    insertComment: InsertComment,
    authorId: number,
    questionId?: number,
    answerId?: number,
  ): Promise<Comment> {
    const result = await db
      .insert(comments)
      .values({ ...insertComment, authorId, questionId, answerId })
      .returning();
    return result[0];
  }

  async voteQuestion(id: number, value: number): Promise<Question> {
    const result = await db
      .update(questions)
      .set({
        votes: sql`votes + ${value}`,
      })
      .where(eq(questions.id, id))
      .returning();
    return result[0];
  }

  async voteAnswer(id: number, value: number): Promise<Answer> {
    const result = await db
      .update(answers)
      .set({
        votes: sql`votes + ${value}`,
      })
      .where(eq(answers.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();