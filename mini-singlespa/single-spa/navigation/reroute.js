import { getAppChanges, shouldBeActive } from "../application/app.helper.js";
import { toBootstrapPromise } from "../lifecycles/bootstrap.js";
import { toLoadPromise } from "../lifecycles/load.js";
import { toMountPromise } from "../lifecycles/mount.js";
import { unmountPromise } from "../lifecycles/unmount.js";
import { started } from "../start.js";
import "../navigation/navigation-event.js";
import { callCaptureEventListeners } from "../navigation/navigation-event.js";

export function reroute(events) {
  // 根据状态对app进行分类
  const { appsToLoad, appsToMount, appsToUnmount } = getAppChanges();
  if (started) {
    // 用户调用了start方法，我们需要处理当前应用的挂载或者卸载
    return performChanges();
  }
  loadApps();
  function loadApps() {
    return Promise.all(appsToLoad.map(toLoadPromise)).then(() =>
      callEventListener(events)
    );
  }
  function performChanges() {
    // 将不需要的应用卸载掉
    // 加载需要的应用--->启动对应的应用--->挂载对应的应用
    const unmountPromises = Promise.all(appsToUnmount.map(unmountPromise));
    // 注册时候是路径/a，但是start的时候是路径/b
    const loadMountPromises = Promise.all(
      appsToLoad.map((app1) => {
        return toLoadPromise(app1).then((app2) => {
          return tryBootstrapAndMount(app2);
        });
      })
    );
    // 当前是/a，切换到/b，再切换回/a，这是两个应用都被load过
    const mountPromises = Promise.all(
      appsToMount.map((app) => {
        return tryBootstrapAndMount(app);
      })
    );
    function tryBootstrapAndMount(app) {
      if (shouldBeActive(app)) {
        // 保证卸载完毕再挂载
        return toBootstrapPromise(app).then((app) => {
          unmountPromises.then(() => toMountPromise(app));
        });
      }
    }
    return Promise.all([loadMountPromises, mountPromises]).then(() =>
      callEventListener(events)
    );
  }
}

function callEventListener(e) {
  callCaptureEventListeners(e);
}
