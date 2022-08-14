import React from "react";
import { useRouter } from "next/router";

function EmptyTaskItem() {
  const router = useRouter();
  return (
    <div className='emypty-task'>
      {router.query.filter == "active" && <p>No active tasks...</p>}
      {router.query.filter == "complete" && <p>No completed tasks...</p>}
      {router.query.filter == "all" && <p>No tasks listed...</p>}
    </div>
  );
}

export default EmptyTaskItem;
