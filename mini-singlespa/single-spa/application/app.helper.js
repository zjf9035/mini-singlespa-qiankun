import { apps } from "./app.js";

export const NOT_LOADED = "NOT_LOADED"; // 未加载
export const LOAD_ERR = "LOAD_ERR"; //  资源加载失败
export const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE"; // 加载资源

// 启动中
export const NOT_BOOTSTRAPED = "NOT_BOOTSTRAPED"; // 资源加载完毕此时还没启动
export const BOOTSTRAPING = "BOOTSTRAPING"; // 启动中
export const NOT_MOUNTED = "NOT_MOUNTED"; // 未挂载

// 挂载流程
export const MOUNTING = "MOUNTING"; // 挂载中
export const MOUNTED = "MOUNTED"; // 挂载完成

// 卸载中
export const UNMOUNTING = "UNMOUNTING";

// 应用是否正在被激活
export function isActive(app) {
  return app.status === MOUNTED;
}

// 应用是否应该被激活
export function shouldBeActive(app) {
  return app.activeWhen(window.location);
}

// 筛选不同状态的应用
export function getAppChanges() {
  const appsToLoad = [];
  const appsToMount = [];
  const appsToUnmount = [];
  apps.forEach((app) => {
    const appShouldBeActive = shouldBeActive(app);
    switch (app.status) {
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        {
          if (appShouldBeActive) {
            appsToLoad.push(app);
          }
        }
        break;
      case NOT_BOOTSTRAPED:
      case BOOTSTRAPING:
      case NOT_MOUNTED:
        if (appShouldBeActive) {
          appsToMount.push(app);
        }
        break;
      case MOUNTED: {
        if (!appShouldBeActive) {
          appsToUnmount.push(app);
        }
        break;
      }
      default:
        break;
    }
  });

  return {
    appsToLoad,
    appsToMount,
    appsToUnmount,
  };
}
