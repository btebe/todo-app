import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const { oldPosition, newPosition, dragList } = req.body;

  // using Array structure scheme
  try {
    //insert old position to new position
    await prisma.task.update({
      where: { id: dragList[oldPosition].id },
      data: { order: dragList[newPosition].order },
    });

    //loops through draglist not db but it updates db's order value
    var index = newPosition;
    while (oldPosition != index) {
      if (dragList[oldPosition].order < dragList[newPosition].order) {
        //moves backwards -1
        await prisma.task.update({
          where: { id: dragList[index].id },
          data: { order: dragList[index].order - 1 },
        });
        index++;
      }
      if (dragList[oldPosition].order > dragList[newPosition].order) {
        //moves forward +1
        await prisma.task.update({
          where: { id: dragList[index].id },
          data: { order: dragList[index].order + 1 },
        });
        index--;
      }
    }
    const taskList = await prisma.task.findMany({
      orderBy: {
        order: "desc",
      },
    });

    res.status(200).send(taskList);

    //res.status(200).send({ message: "update success" });
  } catch (e) {
    res.status(400).send({ message: e });
  }
}
