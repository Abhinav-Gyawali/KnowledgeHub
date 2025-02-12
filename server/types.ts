import { Store } from "express-session";
import {
  User,
  Question,
  Answer,
  Comment,
  InsertUser,
  InsertQuestion,
  InsertAnswer,
  InsertComment,
} from "@shared/schema";

export interface IStorage {
  sessionStore: Store;

  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<void>;
  verifyUserEmail(id: number): Promise<void>;
  updateVerificationToken(id: number, token: string, expiry: Date): Promise<void>;

  // Content management
  getQuestions(): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(
    insertQuestion: InsertQuestion,
    authorId: number,
  ): Promise<Question>;

  getAnswers(questionId: number): Promise<Answer[]>;
  createAnswer(
    insertAnswer: InsertAnswer,
    questionId: number,
    authorId: number,
  ): Promise<Answer>;

  getComments(questionId?: number, answerId?: number): Promise<Comment[]>;
  createComment(
    insertComment: InsertComment,
    authorId: number,
    questionId?: number,
    answerId?: number,
  ): Promise<Comment>;

  voteQuestion(id: number, value: number): Promise<Question>;
  voteAnswer(id: number, value: number): Promise<Answer>;
}