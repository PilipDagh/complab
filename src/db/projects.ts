import { db } from './index.ts';
import { projects } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getAllProjects() {
  try {
    return await db.select().from(projects).orderBy(desc(projects.id));
  } catch (error) {
    console.error('Failed to get projects from Cloud SQL:', error);
    throw new Error('Failed to retrieve work orders.', { cause: error });
  }
}

export async function insertProject(data: {
  title: string;
  benchNumber: string;
  technicianName: string;
  clientOrDepartment?: string;
  deviceType?: string;
  reportedFault: string;
  priority?: string;
  stage?: string;
  status?: string;
  dateCreated: string;
}) {
  try {
    const result = await db
      .insert(projects)
      .values({
        title: data.title,
        benchNumber: data.benchNumber,
        technicianName: data.technicianName,
        clientOrDepartment: data.clientOrDepartment || null,
        deviceType: data.deviceType || null,
        reportedFault: data.reportedFault,
        priority: data.priority || 'Normal',
        stage: data.stage || 'Intake',
        status: data.status || 'ongoing',
        dateCreated: data.dateCreated,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to insert project in Cloud SQL:', error);
    throw new Error('Failed to create work order.', { cause: error });
  }
}

export async function updateProjectById(
  id: number,
  updates: Partial<{
    title: string;
    benchNumber: string;
    technicianName: string;
    clientOrDepartment: string;
    deviceType: string;
    reportedFault: string;
    priority: string;
    stage: string;
    status: string;
    repairOutcomeNotes: string;
    dateCompleted: string;
  }>
) {
  try {
    const result = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to update project in Cloud SQL:', error);
    throw new Error('Failed to update work order.', { cause: error });
  }
}

export async function deleteProjectById(id: number) {
  try {
    return await db.delete(projects).where(eq(projects.id, id)).returning();
  } catch (error) {
    console.error('Failed to delete project in Cloud SQL:', error);
    throw new Error('Failed to remove work order.', { cause: error });
  }
}
