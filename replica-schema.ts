import { pgTable, text, timestamp, serial, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("replica_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").default("web"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const files = pgTable("replica_files", {
  id: serial("id").primaryKey(),
  projectId: serial("project_id").references(() => projects.id),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content"),
  language: text("language"),
  isDirectory: boolean("is_directory").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("replica_conversations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  messages: jsonb("messages").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
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

export const insertConversationSchema = createInsertSchema(conversations);

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  plan?: {
    name: string;
    description: string;
    type: string;
    features: string[];
    technologies: string[];
    preview: {
      title: string;
      description: string;
      sections: string[];
    };
  };
  isWaitingForApproval?: boolean;
}