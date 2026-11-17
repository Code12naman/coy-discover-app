import path from "node:path";
import { createDatabase } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

const globalForCoy = globalThis as typeof globalThis & {
  coyDatabase?: ReturnType<typeof createDatabase>;
};

export function getAppDatabase(): ReturnType<typeof createDatabase> {
  if (!globalForCoy.coyDatabase) {
    const db = createDatabase(path.join(process.cwd(), "data", "app.db"));
    seedDatabase(db);
    globalForCoy.coyDatabase = db;
  }

  return globalForCoy.coyDatabase;
}
