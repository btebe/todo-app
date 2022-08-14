// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const { text, check, order } = req.body;
  try {
    await prisma.task.create({
      data: {
        text,
        check,
        order,
      },
    });

    res.status(200).send({ message: "sucess" });
  } catch (e) {
    res.status(400).send({ message: "something went wrong in create task" });
  }
}
