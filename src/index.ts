import "reflect-metadata";
import { App } from "./app.js";

const application = new App();

export default application.app;

const main = () => {
  if (process.env.NODE_ENV !== "production") {
    application.start();
  }
};

main();