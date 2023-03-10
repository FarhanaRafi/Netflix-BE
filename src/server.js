import Express from "express";
import listEndpoints from "express-list-endpoints";
import mediasRouter from "./api/medias/index.js";
import {
  badRequestHandler,
  genericErrorHandler,
  notfoundHandler,
  unauthorizedHandler,
} from "./errorsHandler.js";
import cors from "cors";
import createHttpError from "http-errors";

const server = Express();
const port = process.env.PORT;

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(
            400,
            `origin ${currentOrigin} is not in  the whitelist`
          )
        );
      }
    },
  })
);

// server.use(Express.static(publicFolderPath));
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
