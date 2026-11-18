import { loadEnvConfig } from "@next/env";
import { createDatabase, initializeDatabase } from "@/lib/db";
import { resetDatabase, seedDatabase } from "@/lib/seed";

loadEnvConfig(process.cwd());

async function main(): Promise<void> {
  const db = createDatabase();
  try {
    await initializeDatabase(db);
    if (process.argv.includes("--reset")) {
      await resetDatabase(db);
    } else {
      await seedDatabase(db);
    }
    console.log("PostgreSQL demo database is ready.");
  } finally {
    await db.close();
  }
}

main().catch((error: unknown) => {
  console.error("Unable to seed PostgreSQL demo database", error);
  process.exitCode = 1;
});
