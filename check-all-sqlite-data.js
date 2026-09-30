const path = require("path");
const { PrismaClient } = require("./node_modules/.prisma/sqlite-migration");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(process.cwd(), "prisma/dev.db")}`,
    },
  },
});

async function main() {
  const models = [
    ["User", prisma.user],
    ["Role", prisma.role],
    ["Permission", prisma.permission],
    ["Employee", prisma.employee],
    ["Department", prisma.department],
    ["Designation", prisma.designation],
    ["Site", prisma.site],
    ["SiteAssignment", prisma.siteAssignment],
    ["Shift", prisma.shift],
    ["Attendance", prisma.attendance],
    ["AttendanceLog", prisma.attendanceLog],
    ["LeaveType", prisma.leaveType],
    ["LeaveBalance", prisma.leaveBalance],
    ["LeaveRequest", prisma.leaveRequest],
    ["SalaryStructure", prisma.salaryStructure],
    ["Payroll", prisma.payroll],
    ["PayrollItem", prisma.payrollItem],
    ["Document", prisma.document],
    ["Notification", prisma.notification],
    ["Holiday", prisma.holiday],
    ["CompanySetting", prisma.companySetting],
    ["AttendanceSetting", prisma.attendanceSetting],
    ["PayrollSetting", prisma.payrollSetting],
    ["AuditLog", prisma.auditLog],
  ];

  console.log("SQLite database verification");
  console.log("============================");

  for (const [name, model] of models) {
    try {
      const count = await model.count();
      console.log(`${name.padEnd(20)} ${count}`);
    } catch (error) {
      console.log(`${name.padEnd(20)} ERROR`);
      console.log(error.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
