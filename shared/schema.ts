import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content").default("").notNull(),
  language: text("language").default("javascript").notNull(),
  isDirectory: boolean("is_directory").default(false).notNull(),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  messages: jsonb("messages").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const codeExecutions = pgTable("code_executions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  output: text("output"),
  error: text("error"),
  status: text("status").notNull(), // 'running', 'completed', 'error'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAIConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCodeExecutionSchema = createInsertSchema(codeExecutions).omit({
  id: true,
  createdAt: true,
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = z.infer<typeof insertAIConversationSchema>;
export type CodeExecution = typeof codeExecutions.$inferSelect;
export type InsertCodeExecution = z.infer<typeof insertCodeExecutionSchema>;

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface FileTreeItem {
  id: number;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeItem[];
  parentId?: number;
}
