import axios from "axios";
export const fetcher = (url) => {
  if (typeof window != "undefined") {
    return axios.get(window.location.origin + url);
  }
};

export const fetcherData = (url, data) => {
  if (typeof window != "undefined") {
    return axios({
      method: "post",
      url: window.location.origin + url,
      data: {
        text: data.text,
        check: data.check,
        order: data.order,
      },
    });
  }
};

export const fetcherUpdate = (url, data) => {
  if (typeof window != "undefined") {
    return axios({
      method: "put",
      url: window.location.origin + url,
      data: {
        check: data.check,
      },
    });
  }
};

export const fetcherUpdateList = (url, data) => {
  if (typeof window != "undefined") {
    return axios({
      method: "put",
      url: window.location.origin + url,
      data: {
        oldPosition: data.oldPosition,
        newPosition: data.newPosition,
        dragList: data.dragList,
      },
    });
  }
};

export const fetcherDelete = (url) => {
  if (typeof window != "undefined") {
    return axios({
      method: "delete",
      url: window.location.origin + url,
    });
  }
};
