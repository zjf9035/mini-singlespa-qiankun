import { NOT_LOADED } from "./app.helper.js";
import { reroute } from "../navigation/reroute.js";

export const apps = [];
export function registerApplication(appName, loadApp, activeWhen, customProps) {
  const registeration = {
    name: appName,
    loadApp,
    activeWhen,
    customProps,
    status: NOT_LOADED,
  };
  apps.push(registeration);

  reroute(); // 重写路由
}
