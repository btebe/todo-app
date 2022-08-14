import React, { useState, useRef } from "react";
import deletebtn from "../public/static/images/icon-cross.svg";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/router";
import { fetcherDelete, fetcherUpdate } from "../utils/fetcher";

function TaskItem({
  id,
  text,
  checked,
  setdragList,
  draglist,
  refreshData,
  mixTask,
  activeTask,
  completeTask,
  sublist,
  setsubList,
  count,
  setCount,
  index,
  setLoading,
}) {
  const router = useRouter();
  const closeRef = useRef();
  const [togglecheck, setToggleCheck] = useState(checked);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1000px)" });

  const handleHover = () => {
    const children = closeRef.current.children[2];
    if (!isTabletOrMobile) {
      children.style.opacity = "1";
    }
  };
  const handleHoverNone = () => {
    const children = closeRef.current.children[2];
    if (!isTabletOrMobile) {
      children.style.opacity = "0";
    }
  };
  const handleCheckbox = async () => {
    setToggleCheck(!togglecheck);
    draglist[index].check = !togglecheck;
    const data = { check: !togglecheck };
    if (data.check == true) {
      setCount(count - 1);
    } else {
      setCount(count + 1);
    }

    await fetcherUpdate(`/api/taskGeneral/${id}`, {
      check: data.check,
    }).then((response) => {
      if (response.data.error) {
        console.log(response.data.error);
      } else {
        refreshData();
        if (router.query.filter == "all") {
          mixTask();
        } else if (router.query.filter == "active") {
          activeTask();
        } else if (router.query.filter == "complete") {
          completeTask();
        }
      }
    });
  };

  const handleDelete = async () => {
    setdragList(draglist.filter((item) => item.id !== id));
    setsubList(sublist.filter((item) => item.id !== id));
    if (togglecheck == false) setCount(count - 1);
    await fetcherDelete(`/api/taskGeneral/${id}`).then((response) => {
      if (response.data.error) {
        console.log(response.data.error);
      } else {
        refreshData();
        if (router.query.filter == "all") {
          mixTask();
        } else if (router.query.filter == "active") {
          activeTask();
        } else if (router.query.filter == "complete") {
          completeTask();
        }
      }
    });
  };
  return (
    <div
      className='task'
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverNone}
      ref={closeRef}
      id={id}
    >
      <input
        type='checkbox'
        name='check'
        id={`task-${id}`}
        checked={togglecheck}
        onChange={handleCheckbox}
      />
      <label htmlFor={`task-${id}`} className='task-label'>
        <span className='custom-checkbox-border'>
          <span className='custom-checkbox'></span>
        </span>
        <p className={togglecheck ? "checked " : ""}>{text}</p>
      </label>
      <div className='image-Wrapper' onClick={handleDelete}>
        <Image src={deletebtn} alt='delete-icon' />
      </div>
    </div>
  );
}

export default TaskItem;
