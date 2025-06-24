import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

// Example "users" table—add more tables as needed
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
});

// Export your schema for Drizzle
export const schema = { users };
