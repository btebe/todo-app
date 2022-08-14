import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const taskList = await prisma.task.findMany({
      where: { check: false },
      orderBy: {
        order: "desc",
      },
    });

    res.status(200).send(taskList);
  } catch (e) {
    res.status(400).send({ message: "something went wrong in orderbyactive" });
  }
}
