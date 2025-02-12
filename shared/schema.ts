import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username").notNull().unique(),
  qualifications: text("qualifications"),
  biography: text("biography"),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

// Update schemas to include required fields
export const insertUserSchema = createInsertSchema(users)
  .pick({
    email: true,
    password: true,
    username: true,
    qualifications: true,
    biography: true,
  })
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    qualifications: z.string().optional(),
    biography: z.string().optional(),
    captchaToken: z.string(),
  });

export const insertQuestionSchema = createInsertSchema(questions)
  .pick({
    title: true,
    content: true,
  })
  .extend({
    mediaUrls: z.array(z.string().url()).optional(),
  });

export const insertAnswerSchema = createInsertSchema(answers)
  .pick({
    content: true,
  })
  .extend({
    mediaUrls: z.array(z.string().url()).optional(),
  });

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type Comment = typeof comments.$inferSelect;