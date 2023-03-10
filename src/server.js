import Express from "express";
import listEndpoints from "express-list-endpoints";
import mediasRouter from "./api/medias/index.js";
import {
  badRequestHandler,
  genericErrorHandler,
  notfoundHandler,
  unauthorizedHandler,
} from "./errorsHandler.js";

const server = Express();
const port = process.env.PORT;

server.use(Express.json());

server.use("/medias", mediasRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notfoundHandler);
server.use(genericErrorHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on port ${port}`);
});
