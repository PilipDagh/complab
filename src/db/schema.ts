import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table managed via Firebase Auth UID and Cloud SQL PostgreSQL
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('ROLE_STUDENT'), // 'ROLE_OWNER' | 'ROLE_STUDENT'
  benchStation: text('bench_station').default('Student Bench Station'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Projects / Work Orders table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  benchNumber: text('bench_number').notNull(),
  technicianName: text('technician_name').notNull(),
  clientOrDepartment: text('client_or_department'),
  deviceType: text('device_type'),
  reportedFault: text('reported_fault').notNull(),
  priority: text('priority').notNull().default('Normal'),
  stage: text('stage').notNull().default('Intake'),
  status: text('status').notNull().default('ongoing'), // 'ongoing' | 'archived'
  repairOutcomeNotes: text('repair_outcome_notes'),
  dateCreated: text('date_created').notNull(),
  dateCompleted: text('date_completed'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Daily Class Activity Calendar Logs table
export const calendarLogs = pgTable('calendar_logs', {
  id: serial('id').primaryKey(),
  dateString: text('date_string').notNull().unique(),
  status: text('status').notNull().default('in_progress'), // 'completed' | 'in_progress' | 'issue_hold'
  topicsCovered: text('topics_covered').default(''),
  benchRepairsPerformed: text('bench_repairs_performed').default(''),
  partsUsedOrOrdered: text('parts_used_or_ordered').default(''),
  specialNotesAndSafety: text('special_notes_and_safety').default(''),
  updatedAt: timestamp('updated_at').defaultNow(),
});
