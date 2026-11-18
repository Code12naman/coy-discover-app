import { createDatabase, initializeDatabase, type AppDatabase } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

const globalForCoy = globalThis as typeof globalThis & {
  coyDatabasePromise?: Promise<AppDatabase>;
};

export function getAppDatabase(): Promise<AppDatabase> {
  if (!globalForCoy.coyDatabasePromise) {
    const database = createDatabase();
    globalForCoy.coyDatabasePromise = (async () => {
      await initializeDatabase(database);
      await seedDatabase(database);
      return database;
    })().catch(async (error: unknown) => {
      globalForCoy.coyDatabasePromise = undefined;
      await database.close().catch((closeError: unknown) => {
        console.error(
          "[database] failed to close after initialization error",
          closeError,
        );
      });
      throw error;
    });
  }

  return globalForCoy.coyDatabasePromise;
}
