const path = require("path");

const {
  PrismaClient: SQLitePrismaClient,
} = require("./node_modules/.prisma/sqlite-migration");

const {
  PrismaClient: PostgresPrismaClient,
} = require("@prisma/client");

const postgresUrl = process.env.POSTGRES_DATABASE_URL;

if (!postgresUrl) {
  throw new Error(
    "POSTGRES_DATABASE_URL is not set. Migration stopped before any database changes."
  );
}

const sqlite = new SQLitePrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(process.cwd(), "prisma/dev.db")}`,
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

const migrationOrder = [
  ["Role", "role"],
  ["Department", "department"],
  ["Designation", "designation"],
  ["Site", "site"],
  ["Shift", "shift"],
  ["LeaveType", "leaveType"],
  ["Employee", "employee"],
  ["Permission", "permission"],
  ["SiteAssignment", "siteAssignment"],
  ["User", "user"],
  ["Attendance", "attendance"],
  ["AttendanceLog", "attendanceLog"],
  ["LeaveBalance", "leaveBalance"],
  ["LeaveRequest", "leaveRequest"],
  ["SalaryStructure", "salaryStructure"],
  ["Payroll", "payroll"],
  ["PayrollItem", "payrollItem"],
  ["Document", "document"],
  ["Notification", "notification"],
  ["Holiday", "holiday"],
  ["CompanySetting", "companySetting"],
  ["AttendanceSetting", "attendanceSetting"],
  ["PayrollSetting", "payrollSetting"],
  ["AuditLog", "auditLog"],
];

async function main() {
  console.log("");
  console.log("================================================");
  console.log("VPHS HRMS SQLITE -> POSTGRESQL REAL MIGRATION");
  console.log("================================================");
  console.log("");
  console.log("SOURCE: prisma/dev.db");
  console.log("TARGET: Render PostgreSQL");
  console.log("");

  // Confirm PostgreSQL is reachable.
  await postgres.$queryRaw`SELECT 1`;

  console.log("PostgreSQL connection: OK");
  console.log("");

  // Safety check: target must be completely empty.
  console.log("Checking PostgreSQL target...");
  console.log("");

  for (const [name, modelName] of migrationOrder) {
    const count = await postgres[modelName].count();

    if (count !== 0) {
      throw new Error(
        `SAFETY STOP: PostgreSQL table ${name} already contains ${count} records. No migration was started.`
      );
    }
  }

  console.log("PostgreSQL target is empty.");
  console.log("");

  // Read all SQLite records before opening the transaction.
  console.log("Reading SQLite data...");
  console.log("");

  const data = {};

  for (const [name, modelName] of migrationOrder) {
    data[modelName] = await sqlite[modelName].findMany();
    console.log(
      `${name.padEnd(20)} ${data[modelName].length} records loaded`
    );
  }

  console.log("");
  console.log("SQLite data loaded successfully.");
  console.log("");

  const total = Object.values(data).reduce(
    (sum, rows) => sum + rows.length,
    0
  );

  console.log(`Total records to migrate: ${total}`);
  console.log("");

  console.log("Starting PostgreSQL transaction...");
  console.log("");

  await postgres.$transaction(
    async (tx) => {
      for (const [name, modelName] of migrationOrder) {
        const rows = data[modelName];

        if (rows.length === 0) {
          console.log(`${name.padEnd(20)} SKIPPED (0 records)`);
          continue;
        }

        const result = await tx[modelName].createMany({
          data: rows,
        });

        console.log(
          `${name.padEnd(20)} INSERTED ${result.count} records`
        );
      }
    },
    {
      maxWait: 15000,
      timeout: 120000,
    }
  );

  console.log("");
  console.log("================================================");
  console.log("TRANSACTION COMMITTED SUCCESSFULLY");
  console.log("================================================");
  console.log("");

  console.log("Final verification:");
  console.log("");

  let sqliteTotal = 0;
  let postgresTotal = 0;

  let verificationFailed = false;

  for (const [name, modelName] of migrationOrder) {
    const sqliteCount = data[modelName].length;
    const postgresCount = await postgres[modelName].count();

    sqliteTotal += sqliteCount;
    postgresTotal += postgresCount;

    const status =
      sqliteCount === postgresCount ? "OK" : "MISMATCH";

    console.log(
      `${name.padEnd(20)} SQLite: ${String(sqliteCount).padStart(4)}   PostgreSQL: ${String(postgresCount).padStart(4)}   ${status}`
    );

    if (sqliteCount !== postgresCount) {
      verificationFailed = true;
    }
  }

  console.log("");
  console.log(`SQLite total:      ${sqliteTotal}`);
  console.log(`PostgreSQL total:  ${postgresTotal}`);
  console.log("");

  if (verificationFailed) {
    throw new Error(
      "FINAL VERIFICATION FAILED: one or more record counts do not match."
    );
  }

  if (sqliteTotal !== postgresTotal) {
    throw new Error(
      `FINAL TOTAL MISMATCH: SQLite=${sqliteTotal}, PostgreSQL=${postgresTotal}`
    );
  }

  console.log("================================================");
  console.log("MIGRATION COMPLETED SUCCESSFULLY");
  console.log("================================================");
  console.log("");
  console.log(`Successfully migrated ${postgresTotal} records.`);
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("================================================");
    console.error("MIGRATION FAILED");
    console.error("================================================");
    console.error("");
    console.error(error);
    console.error("");
    console.error(
      "If the transaction had already started, PostgreSQL rolled it back."
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  });
