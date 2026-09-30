import { db } from './index.ts';
import { calendarLogs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getAllCalendarLogs() {
  try {
    return await db.select().from(calendarLogs).orderBy(desc(calendarLogs.dateString));
  } catch (error) {
    console.error('Failed to get calendar logs from Cloud SQL:', error);
    throw new Error('Failed to retrieve class calendar logs.', { cause: error });
  }
}

export async function upsertCalendarLog(data: {
  dateString: string;
  status?: string;
  topicsCovered?: string;
  benchRepairsPerformed?: string;
  partsUsedOrOrdered?: string;
  specialNotesAndSafety?: string;
}) {
  try {
    const result = await db
      .insert(calendarLogs)
      .values({
        dateString: data.dateString,
        status: data.status || 'in_progress',
        topicsCovered: data.topicsCovered || '',
        benchRepairsPerformed: data.benchRepairsPerformed || '',
        partsUsedOrOrdered: data.partsUsedOrOrdered || '',
        specialNotesAndSafety: data.specialNotesAndSafety || '',
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: calendarLogs.dateString,
        set: {
          status: data.status || 'in_progress',
          topicsCovered: data.topicsCovered || '',
          benchRepairsPerformed: data.benchRepairsPerformed || '',
          partsUsedOrOrdered: data.partsUsedOrOrdered || '',
          specialNotesAndSafety: data.specialNotesAndSafety || '',
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to upsert calendar log in Cloud SQL:', error);
    throw new Error('Failed to save daily class activity log.', { cause: error });
  }
}
