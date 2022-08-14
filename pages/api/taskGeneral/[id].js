import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const method = req.method;
  const taskId = Number(req.query.id);
  const { check } = req.body;

  try {
    let result;

    switch (method) {
      case "GET":
        result = await prisma.task.findUnique({
          where: {
            id: taskId,
          },
        });
        res.json(result);
        break;
      case "PUT":
        //update check
        result = await prisma.task.update({
          where: { id: taskId },
          data: { check: check },
        });
        res.json({
          ...result,
          message: `task with id ${taskId} 's order has been updated`,
        });

        break;
      case "DELETE":
        result = await prisma.task.delete({
          where: { id: taskId },
        });
        res.json({
          ...result,
          message: `task with id ${taskId} has been deleted`,
        });
        break;
      default:
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    res.status(400).json({ message: error.message + method });
  }
}
