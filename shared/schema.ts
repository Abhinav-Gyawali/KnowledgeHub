import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  votes: integer("votes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  mediaUrls: text("media_urls").array(),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  questionId: integer("question_id").notNull(),
  authorId: integer("author_id").notNull(),
  votes: integer("votes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  mediaUrls: text("media_urls").array(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  questionId: integer("question_id"),
  answerId: integer("answer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Update schemas to include optional media URLs
export const insertQuestionSchema = createInsertSchema(questions).pick({
  title: true,
  content: true,
}).extend({
  mediaUrls: z.array(z.string().url()).optional(),
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  content: true,
}).extend({
  mediaUrls: z.array(z.string().url()).optional(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type Comment = typeof comments.$inferSelect;