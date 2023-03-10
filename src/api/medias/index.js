import Express from "express";
import uniqid from "uniqid";
import { getMedia, writeMedia } from "../../lib/fs-tools.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const mediasRouter = Express.Router();

mediasRouter.post("/", async (req, res, next) => {
  try {
    const newMedia = {
      imdbID: uniqid(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mediaArray = await getMedia();
    mediaArray.push(newMedia);
    await writeMedia(mediaArray);
    res.status(201).send({ imdbID: newMedia.imdbID });
  } catch (error) {
    next(error);
  }
});

mediasRouter.get("/", async (req, res, next) => {
  try {
    const mediaArray = await getMedia();
    res.send(mediaArray);
  } catch (error) {
    next(error);
  }
});

mediasRouter.get("/:mediaId", async (req, res, next) => {
  try {
    const mediaArray = await getMedia();
    const foundMedia = mediaArray.find(
      (media) => media.imdbID === req.params.mediaId
    );
    if (foundMedia) {
      res.send(foundMedia);
    } else {
      next(
        createHttpError(
          404,
          `Media with imdbID ${req.params.mediaId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

mediasRouter.put("/:mediaId", async (req, res, next) => {
  try {
    const mediaArray = await getMedia();
    const index = mediaArray.findIndex(
      (media) => media.imdbID === req.params.mediaId
    );
    if (index !== -1) {
      const oldMedia = mediaArray[index];
      const updatedMedia = { ...oldMedia, ...req.body, updatedAt: new Date() };
      mediaArray[index] = updatedMedia;
      await writeMedia(mediaArray);
      res.send(updatedMedia);
    } else {
      next(
        createHttpError(
          404,
          `Media with imdbID ${req.params.mediaId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

mediasRouter.delete("/:mediaId", async (req, res, next) => {
  try {
    const mediaArray = await getMedia();
    const remainingMedia = mediaArray.filter(
      (media) => media.imdbID !== req.params.mediaId
    );
    if (mediaArray.length !== remainingMedia.length) {
      await writeMedia(remainingMedia);
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Media with imdbID ${req.params.mediaId} is not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "Netflix/media",
    },
  }),
}).single("poster");

mediasRouter.post(
  "/:mediaId/poster",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const mediaArray = await getMedia();
      const index = mediaArray.findIndex(
        (media) => media.imdbID === req.params.mediaId
      );
      if (index !== -1) {
        const mediaToUpdate = mediaArray[index];
        const updatedMedia = {
          ...mediaToUpdate,
          poster: req.file.path,
        };
        mediaArray[index] = updatedMedia;
        await writeMedia(mediaArray);
      }
      res.send({ message: "file uploaded" });
    } catch (error) {
      next(error);
    }
  }
);

export default mediasRouter;