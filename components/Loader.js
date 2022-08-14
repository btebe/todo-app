import React from "react";

function Loader({ loading }) {
  return <div className='emypty-task'>{loading && <p>Loading...</p>}</div>;
}

export default Loader;
