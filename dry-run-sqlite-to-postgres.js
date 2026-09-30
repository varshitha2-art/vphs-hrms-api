const path = require("path");

const { PrismaClient: SQLitePrismaClient } =
  require("./node_modules/.prisma/sqlite-migration");

const { PrismaClient: PostgresPrismaClient } =
  require("@prisma/client");

const sqlite = new SQLitePrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(process.cwd(), "prisma/dev.db")}`,
    },
  },
});

const postgresUrl = process.env.POSTGRES_DATABASE_URL;

if (!postgresUrl) {
  throw new Error(
    "POSTGRES_DATABASE_URL is not set. No migration or database changes were made."
  );
}

const postgres = new PostgresPrismaClient({
  datasources: {
    db: {
      url: postgresUrl,
    },
  },
});

const models = [
  ["User", sqlite.user, postgres.user],
  ["Role", sqlite.role, postgres.role],
  ["Permission", sqlite.permission, postgres.permission],
  ["Employee", sqlite.employee, postgres.employee],
  ["Department", sqlite.department, postgres.department],
  ["Designation", sqlite.designation, postgres.designation],
  ["Site", sqlite.site, postgres.site],
  ["SiteAssignment", sqlite.siteAssignment, postgres.siteAssignment],
  ["Shift", sqlite.shift, postgres.shift],
  ["Attendance", sqlite.attendance, postgres.attendance],
  ["AttendanceLog", sqlite.attendanceLog, postgres.attendanceLog],
  ["LeaveType", sqlite.leaveType, postgres.leaveType],
  ["LeaveBalance", sqlite.leaveBalance, postgres.leaveBalance],
  ["LeaveRequest", sqlite.leaveRequest, postgres.leaveRequest],
  ["SalaryStructure", sqlite.salaryStructure, postgres.salaryStructure],
  ["Payroll", sqlite.payroll, postgres.payroll],
  ["PayrollItem", sqlite.payrollItem, postgres.payrollItem],
  ["Document", sqlite.document, postgres.document],
  ["Notification", sqlite.notification, postgres.notification],
  ["Holiday", sqlite.holiday, postgres.holiday],
  ["CompanySetting", sqlite.companySetting, postgres.companySetting],
  ["AttendanceSetting", sqlite.attendanceSetting, postgres.attendanceSetting],
  ["PayrollSetting", sqlite.payrollSetting, postgres.payrollSetting],
  ["AuditLog", sqlite.auditLog, postgres.auditLog],
];

async function main() {
  console.log("");
  console.log("==============================================");
  console.log("VPHS HRMS SQLITE -> POSTGRESQL DRY RUN");
  console.log("==============================================");
  console.log("");
  console.log("IMPORTANT: DRY RUN ONLY");
  console.log("No records will be inserted, updated, or deleted.");
  console.log("");

  // Test PostgreSQL connection
  await postgres.$queryRaw`SELECT 1`;
  console.log("PostgreSQL connection: OK");
  console.log("");

  let totalSQLite = 0;
  let totalPostgres = 0;
  let problems = 0;

  console.log("Record counts");
  console.log("-------------");

  for (const [name, source, target] of models) {
    const sqliteCount = await source.count();
    const postgresCount = await target.count();

    totalSQLite += sqliteCount;
    totalPostgres += postgresCount;

    const status = postgresCount === 0 ? "READY" : "NOT EMPTY";

    console.log(
      `${name.padEnd(20)} SQLite: ${String(sqliteCount).padStart(4)}   PostgreSQL: ${String(postgresCount).padStart(4)}   ${status}`
    );

    if (postgresCount !== 0) {
      problems++;
    }
  }

  console.log("");
  console.log(`Total SQLite records:      ${totalSQLite}`);
  console.log(`Total PostgreSQL records:  ${totalPostgres}`);
  console.log("");

  // Load source data for relationship checks
  const roles = await sqlite.role.findMany({ select: { id: true } });
  const employees = await sqlite.employee.findMany({
    select: {
      id: true,
      employeeId: true,
      departmentId: true,
      designationId: true,
      siteId: true,
      shiftId: true,
      reportingManagerId: true,
    },
  });
  const departments = await sqlite.department.findMany({
    select: { id: true },
  });
  const designations = await sqlite.designation.findMany({
    select: { id: true },
  });
  const sites = await sqlite.site.findMany({
    select: { id: true },
  });
  const shifts = await sqlite.shift.findMany({
    select: { id: true },
  });
  const leaveTypes = await sqlite.leaveType.findMany({
    select: { id: true },
  });
  const attendances = await sqlite.attendance.findMany({
    select: { id: true },
  });
  const payrolls = await sqlite.payroll.findMany({
    select: { id: true },
  });
  const users = await sqlite.user.findMany({
    select: { id: true, employeeId: true },
  });

  const sets = {
    roleIds: new Set(roles.map(x => x.id)),
    employeeIds: new Set(employees.map(x => x.id)),
    employeeCodes: new Set(employees.map(x => x.employeeId)),
    departmentIds: new Set(departments.map(x => x.id)),
    designationIds: new Set(designations.map(x => x.id)),
    siteIds: new Set(sites.map(x => x.id)),
    shiftIds: new Set(shifts.map(x => x.id)),
    leaveTypeIds: new Set(leaveTypes.map(x => x.id)),
    attendanceIds: new Set(attendances.map(x => x.id)),
    payrollIds: new Set(payrolls.map(x => x.id)),
    userIds: new Set(users.map(x => x.id)),
  };

  function checkReference(condition, message) {
    if (!condition) {
      console.log(`REFERENCE ERROR: ${message}`);
      problems++;
    }
  }

  console.log("Foreign-key/reference checks");
  console.log("----------------------------");

  const permissions = await sqlite.permission.findMany({
    select: { id: true, roleId: true },
  });

  for (const row of permissions) {
    checkReference(
      sets.roleIds.has(row.roleId),
      `Permission ${row.id} -> Role ${row.roleId}`
    );
  }

  for (const row of employees) {
    if (row.departmentId)
      checkReference(
        sets.departmentIds.has(row.departmentId),
        `Employee ${row.employeeId} -> Department ${row.departmentId}`
      );

    if (row.designationId)
      checkReference(
        sets.designationIds.has(row.designationId),
        `Employee ${row.employeeId} -> Designation ${row.designationId}`
      );

    if (row.siteId)
      checkReference(
        sets.siteIds.has(row.siteId),
        `Employee ${row.employeeId} -> Site ${row.siteId}`
      );

    if (row.shiftId)
      checkReference(
        sets.shiftIds.has(row.shiftId),
        `Employee ${row.employeeId} -> Shift ${row.shiftId}`
      );

    if (row.reportingManagerId)
      checkReference(
        sets.employeeIds.has(row.reportingManagerId),
        `Employee ${row.employeeId} -> Manager ${row.reportingManagerId}`
      );
  }

  for (const row of users) {
    if (row.employeeId)
      checkReference(
        sets.employeeCodes.has(row.employeeId),
        `User ${row.id} -> Employee.employeeId ${row.employeeId}`
      );
  }

  const siteAssignments = await sqlite.siteAssignment.findMany({
    select: { id: true, employeeId: true, siteId: true },
  });

  for (const row of siteAssignments) {
    checkReference(
      sets.employeeIds.has(row.employeeId),
      `SiteAssignment ${row.id} -> Employee ${row.employeeId}`
    );

    checkReference(
      sets.siteIds.has(row.siteId),
      `SiteAssignment ${row.id} -> Site ${row.siteId}`
    );
  }

  const attendanceRows = await sqlite.attendance.findMany({
    select: { id: true, employeeId: true, siteId: true, shiftId: true },
  });

  for (const row of attendanceRows) {
    checkReference(
      sets.employeeIds.has(row.employeeId),
      `Attendance ${row.id} -> Employee ${row.employeeId}`
    );

    if (row.siteId)
      checkReference(
        sets.siteIds.has(row.siteId),
        `Attendance ${row.id} -> Site ${row.siteId}`
      );

    if (row.shiftId)
      checkReference(
        sets.shiftIds.has(row.shiftId),
        `Attendance ${row.id} -> Shift ${row.shiftId}`
      );
  }

  const attendanceLogs = await sqlite.attendanceLog.findMany({
    select: { id: true, employeeId: true, attendanceId: true },
  });

  for (const row of attendanceLogs) {
    checkReference(
      sets.employeeIds.has(row.employeeId),
      `AttendanceLog ${row.id} -> Employee ${row.employeeId}`
    );

    if (row.attendanceId)
      checkReference(
        sets.attendanceIds.has(row.attendanceId),
        `AttendanceLog ${row.id} -> Attendance ${row.attendanceId}`
      );
  }

  const leaveBalances = await sqlite.leaveBalance.findMany({
    select: { id: true, employeeId: true, leaveTypeId: true },
  });

  for (const row of leaveBalances) {
    checkReference(
      sets.employeeIds.has(row.employeeId),
      `LeaveBalance ${row.id} -> Employee ${row.employeeId}`
    );

    checkReference(
      sets.leaveTypeIds.has(row.leaveTypeId),
      `LeaveBalance ${row.id} -> LeaveType ${row.leaveTypeId}`
    );
  }

  const leaveRequests = await sqlite.leaveRequest.findMany({
    select: { id: true, employeeId: true, leaveTypeId: true },
  });

  for (const row of leaveRequests) {
    checkReference(
      sets.employeeIds.has(row.employeeId),
      `LeaveRequest ${row.id} -> Employee ${row.employeeId}`
    );

    checkReference(
      sets.leaveTypeIds.has(row.leaveTypeId),
      `LeaveRequest ${row.id} -> LeaveType ${row.leaveTypeId}`
    );
  }

  const salaryStructures = await sqlite.salaryStructure.findMany({
    select: { id: true, employeeId: true },
  });

  for (const row of salaryStructures) {
    checkReference(
      sets.employeeIds.has(row.employeeId),
      `SalaryStructure ${row.id} -> Employee ${row.employeeId}`
    );
  }

  const payrollItems = await sqlite.payrollItem.findMany({
    select: { id: true, employeeId: true, payrollId: true },
  });

  for (const row of payrollItems) {
    checkReference(
      sets.employeeIds.has(row.employeeId),
      `PayrollItem ${row.id} -> Employee ${row.employeeId}`
    );

    checkReference(
      sets.payrollIds.has(row.payrollId),
      `PayrollItem ${row.id} -> Payroll ${row.payrollId}`
    );
  }

  const documents = await sqlite.document.findMany({
    select: { id: true, employeeId: true },
  });

  for (const row of documents) {
    checkReference(
      sets.employeeIds.has(row.employeeId),
      `Document ${row.id} -> Employee ${row.employeeId}`
    );
  }

  const notifications = await sqlite.notification.findMany({
    select: { id: true, userId: true },
  });

  for (const row of notifications) {
    checkReference(
      sets.userIds.has(row.userId),
      `Notification ${row.id} -> User ${row.userId}`
    );
  }

  const holidays = await sqlite.holiday.findMany({
    select: { id: true, siteId: true },
  });

  for (const row of holidays) {
    if (row.siteId)
      checkReference(
        sets.siteIds.has(row.siteId),
        `Holiday ${row.id} -> Site ${row.siteId}`
      );
  }

  const auditLogs = await sqlite.auditLog.findMany({
    select: { id: true, userId: true, employeeId: true },
  });

  for (const row of auditLogs) {
    if (row.userId)
      checkReference(
        sets.userIds.has(row.userId),
        `AuditLog ${row.id} -> User ${row.userId}`
      );

    if (row.employeeId)
      checkReference(
        sets.employeeIds.has(row.employeeId),
        `AuditLog ${row.id} -> Employee ${row.employeeId}`
      );
  }

  if (problems === 0) {
    console.log("All reference checks passed.");
  }

  console.log("");
  console.log("==============================================");

  if (problems === 0) {
    console.log("DRY RUN RESULT: READY");
    console.log("==============================================");
    console.log("");
    console.log("No data was changed.");
    console.log("PostgreSQL is empty and the SQLite references are valid.");
    console.log("");
    console.log("The next step will be the REAL data migration.");
  } else {
    console.log("DRY RUN RESULT: PROBLEMS FOUND");
    console.log("==============================================");
    console.log("");
    console.log(`Problems found: ${problems}`);
    console.log("No data was changed.");
    console.log("Do NOT start the real migration yet.");
  }
}

main()
  .catch(error => {
    console.error("");
    console.error("DRY RUN FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  });
