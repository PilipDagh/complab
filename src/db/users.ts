import { db } from './index.ts';
import { users } from './schema.ts';
import { eq, sql } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  benchStation?: string
) {
  try {
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      // Update display name or bench station if changed
      if (displayName && displayName !== existing[0].displayName) {
        const updated = await db
          .update(users)
          .set({ displayName, email })
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }
      return existing[0];
    }

    // Check count of existing users to determine first-account Owner elevation
    const countResult = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(users);
    const userCount = countResult[0]?.count || 0;
    const assignedRole = userCount === 0 ? 'ROLE_OWNER' : 'ROLE_STUDENT';
    const assignedStation =
      userCount === 0 ? 'Instructor Master Station #1' : benchStation || `Student Station #${userCount + 1}`;

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role: assignedRole,
        benchStation: assignedStation,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || email.split('@')[0],
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database user registration/retrieval failed:', error);
    throw new Error('Database user sync failed.', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Failed to query users from Cloud SQL:', error);
    throw new Error('Failed to retrieve users.', { cause: error });
  }
}

export async function updateUserRole(uid: string, role: string) {
  try {
    return await db.update(users).set({ role }).where(eq(users.uid, uid)).returning();
  } catch (error) {
    console.error('Failed to update user role in Cloud SQL:', error);
    throw new Error('Failed to update user role.', { cause: error });
  }
}
