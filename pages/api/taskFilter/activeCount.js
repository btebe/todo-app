import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const count = await prisma.task.count({
      where: {
        check: false,
      },
    });

    res.status(200).send(count);
  } catch (e) {
    res.status(400).send({ message: "something went wrong in active count" });
  }
}
