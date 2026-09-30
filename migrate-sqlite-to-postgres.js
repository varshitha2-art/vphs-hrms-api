const path = require("path");

const { PrismaClient: SQLitePrismaClient } = require("./node_modules/.prisma/sqlite-migration");
const { PrismaClient: PostgresPrismaClient } = require("@prisma/client");

// Existing local SQLite database
const sqliteUrl = `file:${path.resolve(process.cwd(), "prisma/dev.db")}`;

// Render PostgreSQL URL must be supplied temporarily when running the script.
const postgresUrl = process.env.POSTGRES_DATABASE_URL;

if (!postgresUrl) {
  throw new Error(
    "POSTGRES_DATABASE_URL is not set. The migration has NOT started."
  );
}

const sqlite = new SQLitePrismaClient({
  datasources: {
    db: {
      url: sqliteUrl,
    },
  },
});

const postgres = new PostgresPrismaClient({
  datasources: {
    db: {
      url: postgresUrl,
    },
  },
});

async function main() {
  console.log("========================================");
  console.log("VPHS HRMS SQLite ? PostgreSQL Migration");
  console.log("========================================");
  console.log("");
  console.log("Source: prisma/dev.db");
  console.log("Target: Render PostgreSQL");
  console.log("");
  console.log("Migration script created successfully.");
  console.log("No data has been copied yet.");
  console.log("");

  const sqliteUsers = await sqlite.user.count();
  const sqliteEmployees = await sqlite.employee.count();
  const sqliteAttendance = await sqlite.attendance.count();

  console.log("SQLite verification:");
  console.log(`  Users:      ${sqliteUsers}`);
  console.log(`  Employees:  ${sqliteEmployees}`);
  console.log(`  Attendance: ${sqliteAttendance}`);
  console.log("");

  const postgresUsers = await postgres.user.count();
  const postgresEmployees = await postgres.employee.count();
  const postgresAttendance = await postgres.attendance.count();

  console.log("PostgreSQL verification:");
  console.log(`  Users:      ${postgresUsers}`);
  console.log(`  Employees:  ${postgresEmployees}`);
  console.log(`  Attendance: ${postgresAttendance}`);
  console.log("");

  console.log("TEST ONLY — no records were inserted.");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Migration test failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  });
