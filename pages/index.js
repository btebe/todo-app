import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import moonIcon from "../images/icon-moon.svg";
import sunIcon from "../images/icon-sun.svg";
import TaskItem from "../components/TaskItem";
import EmptyTaskItem from "../components/EmptyTaskItem";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useRouter } from "next/router";
import {
  fetcher,
  fetcherData,
  fetcherDelete,
  fetcherUpdateList,
} from "../utils/fetcher";
import { prisma } from "../lib/prisma";

export default function Home({ dragdata, originaldata, activecount, filter }) {
  const router = useRouter();

  //const states

  // state for loading list
  const [loading, setLoading] = useState(false);

  //state for tooggling a task item's checkbox
  const [togglecheck, setToggleCheck] = useState(false);

  //state for tooggling darkmode or light mode
  const [toggleThemeMode, setToggleThemeMode] = useState(false);

  // states for refereshing props
  const [isRefreshing, setIsRefreshing] = useState(false);

  //for drag and drop to work
  const [isBrowser, setIsBrowser] = useState(false);

  // state for the task
  const [task, setTask] = useState("");

  //state for how many active tasks are left
  const [count, setCount] = useState(activecount);

  //list states

  //state for storing lists of tasks
  const [draglist, setdragList] = useState(dragdata);

  //state for storing lists of tasks the untouched version
  const [sublist, setsubList] = useState(originaldata);

  //to refresh props
  const refreshData = () => {
    router.replace(router.asPath);
    setIsRefreshing(true);
  };

  useEffect(() => {
    const data = window.localStorage.getItem("darkMode");
    if (data != null) setToggleThemeMode(JSON.parse(data));
  }, []);
  useEffect(() => {
    window.localStorage.setItem("darkMode", JSON.stringify(toggleThemeMode));
  }, [toggleThemeMode]);

  useEffect(() => {
    setIsBrowser(window !== "undefined");
    setIsRefreshing(false);
    if (filter) router.push("/?filter=all", undefined, { shallow: true });
    // eslint-disable-line react-hooks/exhaustive-deps
  }, []);

  /*
  droppedItem: is the item grabed and droped from list.
  Description: this handles the logic of dragging a specific item from the list 
    and drop it to a specific position in the list.
  */
  const handleDrop = (droppedItem) => {
    // Ignore drop outside droppable container
    if (!droppedItem.destination) return;
    var updatedList = [...draglist];
    //position consts
    const oldPosition = droppedItem.source.index;
    const newPosition = droppedItem.destination.index;
    // Remove dragged item
    const [reorderedItem] = updatedList.splice(oldPosition, 1);
    // Add dropped item
    updatedList.splice(newPosition, 0, reorderedItem);
    // Update State

    setdragList(updatedList);
    setsubList(updatedList);

    //update db
    UpdateDbOrderList(oldPosition, newPosition, draglist);
  };

  /*
  oldPosition: initial position of a task that's been grabbed.
  newPosition: new position that's been dropped in the list. mainly,
    replacing another task's position.
  list: list of items that's being altered by drag and drop.
  Description: when task list is altered, this function updates
    the database to match altered list.
  */
  const UpdateDbOrderList = async (oldPosition, newPosition, list) => {
    await fetcherUpdateList("/api/taskGeneral/updateList", {
      oldPosition: oldPosition,
      newPosition: newPosition,
      dragList: list,
    }).then((response) => {
      if (response.data.error) {
        console.log(response.data.error);
      } else {
        refreshData();
        setsubList(response.data);
        // if (router.query.filter == "all") {
        //   handleAllTasks();
        // } else if (router.query.filter == "active") {
        //   handleActiveTasks();
        // } else if (router.query.filter == "complete") {
        //   handleCompleteTasks();
        // }
      }
    });
  };

  /*
  Description: in the process of draging an item and droping an item, this function
   handles the styles of that item when in that state. 
  */
  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: "none",
    // change background colour if dragging
    background: isDragging ? "var(--onDrag-bg)" : "inherit",
    border: isDragging ? "1px solid var(--onDrage-border)" : "inherit",
    // styles we need to apply on draggables
    ...draggableStyle,
  });

  /*
  Description: this is a form submission. When submitted, it adds a new 
  created task to the list
  */
  const addTask = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    data.check = togglecheck;
    data.text = task;

    if (data.check == false) setCount(count + 1);

    if (sublist.length == 0) {
      data.order = 0;
      data.id = 1;
    } else {
      data.order = sublist.length;
      data.id = sublist[0].id + 1;
    }
    const newList = [data, ...draglist];
    const newsubList = [data, ...sublist];

    setdragList(newList);
    setsubList(newsubList);
    createTask(data);
    setTask("");
    setToggleCheck(false);
  };

  /*
  Description: this allows the submitted newly created task to also be add in the database.
  */
  const createTask = async (data) => {
    await fetcherData("/api/taskGeneral/newTask", {
      text: data.text,
      check: data.check,
      order: data.order,
    }).then((response) => {
      if (response.data.error) {
        console.log(response.data.error);
      } else {
        refreshData();
        if (router.query.filter == "all") {
          handleAllTasks();
        } else if (router.query.filter == "active") {
          handleActiveTasks();
        } else if (router.query.filter == "complete") {
          handleCompleteTasks();
        }
      }
    });
  };

  /*
  Description: this returns the full list of tasks from DB.
  */
  const handleAllTasks = async () => {
    router.push("/?filter=all", undefined, { shallow: true });
    //setLoading(true);
    await fetcher("/api/taskFilter/allTask").then((response) => {
      if (response.data.error) {
        console.log(response.data.error);
      } else {
        setdragList(response.data);
        //setLoading(false);
      }
    });
  };

  /*
  Description: this returns the only the list of active tasks from DB.
  */
  const handleActiveTasks = async () => {
    router.push("/?filter=active", undefined, { shallow: true });
    //setLoading(true);
    await fetcher("/api/taskFilter/orderByActive").then((response) => {
      if (response.data.error) {
        console.log(response.data.error);
      } else {
        setdragList(response.data);
        //setLoading(false);
      }
    });
  };

  /*
  Description: this returns the only the list of completed tasks from DB.
  */
  const handleCompleteTasks = async () => {
    router.push("/?filter=complete", undefined, { shallow: true });
    //setLoading(true);
    await fetcher("/api/taskFilter/orderByComplete").then((response) => {
      if (response.data.error) {
        console.log(response.data.error);
      } else {
        setdragList(response.data);
        //setLoading(false);
      }
    });
  };

  /*
  Description: this removes and deletes all completed tasks from both list and DB.
  */
  const handleClearCompleted = async () => {
    setdragList(draglist.filter((item) => item.check !== true));
    setsubList(sublist.filter((item) => item.check !== true));
    await fetcherDelete("/api/taskFilter/clearCompleted").then((response) => {
      if (response.data.error) {
        console.log(response.data.error);
      } else {
        refreshData();
      }
    });
  };

  return (
    <div
      className={
        toggleThemeMode
          ? `${styles.container} ${styles.theme}`
          : `${styles.container} ${styles.theme} darkMode`
      }
    >
      <Head>
        <title>Frontend Mentor | Todo app</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon-32x32.png' />
      </Head>

      <main className={styles.main}>
        <h1>Todo</h1>
        <div className={styles.imageWrapper}>
          {toggleThemeMode ? (
            <Image
              src={moonIcon}
              alt='moon-icon'
              onClick={() => setToggleThemeMode(!toggleThemeMode)}
            />
          ) : (
            <Image
              src={sunIcon}
              alt='sun-icon'
              onClick={() => setToggleThemeMode(!toggleThemeMode)}
            />
          )}
        </div>

        <form onSubmit={addTask} className={styles.form}>
          <input
            type='checkbox'
            name='check'
            checked={togglecheck}
            onChange={() => setToggleCheck(!togglecheck)}
            id='for-task'
          />
          <label htmlFor='for-task' className='task-label'>
            <span className='custom-checkbox-border'>
              <span className='custom-checkbox'></span>
            </span>
            <input
              name='text'
              value={task}
              type='text'
              onChange={(e) => setTask(e.target.value)}
              required
              className={togglecheck ? "checked" : ""}
              placeholder='Create a new todo...'
              autoComplete='off'
            />
          </label>
          <button type='submit' className='sr-only'>
            add
          </button>
        </form>
        <div className={styles.taskItemContainer}>
          <div className='task-list flow'>
            {isBrowser ? (
              <DragDropContext onDragEnd={handleDrop}>
                <Droppable droppableId='list-container'>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {loading && <EmptyTaskItem loading={loading} />}
                      {!loading && draglist.length < 1 && <EmptyTaskItem />}
                      {!loading &&
                        draglist.length > 0 &&
                        draglist.map((item, index) => (
                          <Draggable
                            key={item.id.toString()}
                            draggableId={item.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                                {...provided.draggableProps}
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                )}
                              >
                                <TaskItem
                                  id={item.id}
                                  text={item.text}
                                  checked={item.check}
                                  setdragList={setdragList}
                                  draglist={draglist}
                                  refreshData={refreshData}
                                  mixTask={handleAllTasks}
                                  activeTask={handleActiveTasks}
                                  completeTask={handleCompleteTasks}
                                  sublist={sublist}
                                  setsubList={setsubList}
                                  count={count}
                                  setCount={setCount}
                                  index={index}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : null}
          </div>

          <div className={styles.listFilter}>
            {count === 1 ? <p>{count} item left</p> : <p>{count} items left</p>}

            <ul>
              <li
                className={
                  router.query.filter == "all" ? `${styles.active}` : ""
                }
                onClick={handleAllTasks}
              >
                All
              </li>
              <li
                className={
                  router.query.filter == "active" ? `${styles.active}` : ""
                }
                onClick={handleActiveTasks}
              >
                Active
              </li>
              <li
                className={
                  router.query.filter == "complete" ? `${styles.active}` : ""
                }
                onClick={handleCompleteTasks}
              >
                Complete
              </li>
            </ul>
            <p onClick={handleClearCompleted}>Clear Completed</p>
          </div>
        </div>
        <p>Drag and drop to reorder list </p>
      </main>
    </div>
  );
}

export const getServerSideProps = async (ctx) => {
  let data;
  let filter;
  switch (ctx.query.filter) {
    case "all":
      data = await prisma.task.findMany({ orderBy: { order: "desc" } });
      filter = null;
      break;
    case "active":
      data = await prisma.task.findMany({
        where: { check: false },
        orderBy: {
          order: "desc",
        },
      });
      filter = null;
      break;
    case "complete":
      data = await prisma.task.findMany({
        where: { check: true },
        orderBy: {
          order: "desc",
        },
      });
      filter = null;
      break;
    default:
      const res4 = await prisma.task.findMany({ orderBy: { order: "desc" } });
      data = res4;
      filter = "all";
  }

  const orgdata = await prisma.task.findMany({ orderBy: { order: "desc" } });
  const count = await prisma.task.count({
    where: {
      check: false,
    },
  });

  return {
    props: {
      dragdata: data,
      originaldata: orgdata,
      activecount: count,
      filter: filter,
    },
  };
};
