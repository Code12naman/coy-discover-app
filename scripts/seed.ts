import path from "node:path";
import { createDatabase } from "@/lib/db";
import { resetDatabase, seedDatabase } from "@/lib/seed";

const db = createDatabase(path.join(process.cwd(), "data", "app.db"));
if (process.argv.includes("--reset")) {
  resetDatabase(db);
} else {
  seedDatabase(db);
}
db.close();
console.log("Demo database is ready.");
