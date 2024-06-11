import { reroute } from "./reroute.js";

// 对用户的路径切换进行劫持
function urlRoute() {
  reroute(arguments);
}
const capturedEventlisteners = {
  hashchange: [],
  popstate: [],
};
const listeningTo = ["hashchange", "popstate"];

window.addEventListener("hashchange", urlRoute);
window.addEventListener("popstate", urlRoute);

const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

window.addEventListener = function (eventName, callback) {
  if (
    listeningTo.includes(eventName) &&
    !capturedEventlisteners[eventName].some((item) => item === callback)
  ) {
    // 是用window.addEventListener监听的其他事件
    return capturedEventlisteners[eventName].push(callback);
  }
  return originalAddEventListener.apply(this, arguments);
};
window.removeEventListener = function (eventName, callback) {
  if (listeningTo.includes(eventName)) {
    capturedEventlisteners[eventName] = capturedEventlisteners[
      eventName
    ].filter((fn) => fn !== callback);
    return;
  }
  return originalRemoveEventListener.apply(this, arguments);
};

function patchFn(updateState, methodName) {
  return function () {
    const urlBefore = window.location.href;
    const r = updateState.apply(this, arguments);
    const urlAfter = window.location.href;
    if (urlBefore !== urlAfter) {
      // 手动派发
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    return r;
  };
}

window.history.pushState = patchFn(window.history.pushState, "pushState");
window.history.replaceState = patchFn(
  window.history.replaceState,
  "replaceState"
);

export function callCaptureEventListeners(e) {
  if (e) {
    const eventType = e[0].type;
    if (listeningTo.includes(eventType)) {
      capturedEventlisteners[eventType].forEach((listener) => {
        listener.apply(this, e);
      });
    }
  }
}
