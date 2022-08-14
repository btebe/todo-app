const { PrismaClient } = require("@prisma/client");
const { tasks } = require("./tasks");

const prisma = new PrismaClient();

const main = async () => {
  for (let task of tasks) {
    await prisma.task.create({
      data: task,
    });
  }
};

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
