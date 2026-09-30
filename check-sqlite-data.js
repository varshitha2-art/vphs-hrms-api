const { PrismaClient } = require("./node_modules/.prisma/sqlite-migration");

const prisma = new PrismaClient();

async function main() {
  const counts = {
    users: await prisma.user.count(),
    roles: await prisma.role.count(),
    employees: await prisma.employee.count(),
    departments: await prisma.department.count(),
    designations: await prisma.designation.count(),
    sites: await prisma.site.count(),
    attendance: await prisma.attendance.count(),
    documents: await prisma.document.count(),
    leaveBalances: await prisma.leaveBalance.count(),
    leaveRequests: await prisma.leaveRequest.count(),
    payrolls: await prisma.payroll.count(),
    payrollItems: await prisma.payrollItem.count(),
    salaryStructures: await prisma.salaryStructure.count(),
  };

  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
