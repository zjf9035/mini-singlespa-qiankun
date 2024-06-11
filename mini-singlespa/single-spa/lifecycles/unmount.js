import { MOUNTED, NOT_MOUNTED, UNMOUNTING } from "../application/app.helper.js";

export function unmountPromise(app) {
  return Promise.resolve().then(() => {
    if (app.status !== MOUNTED) {
      return app;
    }
    app.status = UNMOUNTING;
    // app.unmount可能是一个数组
    return app.unmount(app.customProps).then(() => {
      app.status = NOT_MOUNTED;
    });
  });
}
