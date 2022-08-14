import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    await prisma.task.deleteMany({
      where: { check: true },
    });

    res.status(200).send("Comopleted items have been deleted");
  } catch (e) {
    res.status(400).send({ message: "something went wrong in clear complete" });
  }
}
