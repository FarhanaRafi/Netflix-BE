import Express from "express";
import uniqid from "uniqid";
import {
  getMedia,
  writeMedia,
  getReviews,
  writeReviews,
} from "../../lib/fs-tools.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";
import { checkMediaSchema, triggerBadRequest } from "./validation.js";

const mediasRouter = Express.Router();

mediasRouter.post(
  "/",
  checkMediaSchema,
  triggerBadRequest,
  async (req, res, next) => {
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
  }
);

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

mediasRouter.get("/:mediaId/pdf", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=media.pdf");
    const mediaArray = await getMedia();
    const foundMedia = mediaArray.find(
      (media) => media.imdbID === req.params.mediaId
    );
    const source = await getPDFReadableStream(foundMedia);
    const destination = res;
    pipeline(source, destination, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (error) {
    next(error);
  }
});

mediasRouter.post("/:mediaId/reviews", async (req, res, next) => {
  try {
    const newReview = {
      ...req.body,
      _id: uniqid(),
      imdbID: req.params.mediaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const reviewsArray = await getReviews();
    reviewsArray.push(newReview);
    await writeReviews(reviewsArray);
    res.status(201).send({ _id: newReview._id });
  } catch (error) {
    next(error);
  }
});

mediasRouter.get("/:mediaId/reviews", async (req, res, next) => {
  try {
    const reviews = await getReviews();
    // const currentId = reviews.some(
    //   (review) => review.mediaId === req.params.mediaId
    // );

    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

mediasRouter.get("/:mediaId/reviews/:reviewId", async (req, res, next) => {
  try {
    const reviewsArray = await getReviews();
    const foundReview = reviewsArray.find(
      (review) => review._id === req.params.reviewId
    );
    if (foundReview) {
      res.send(foundReview);
    } else {
      next(
        createHttpError(404, `Review with id ${req.params.reviewId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

mediasRouter.put("/:mediaId/reviews/:reviewId", async (req, res, next) => {
  try {
    const reviewsArray = await getReviews();
    const index = reviewsArray.findIndex(
      (review) => review._id === req.params.reviewId
    );
    if (index !== -1) {
      const oldReview = reviewsArray[index];
      const updatedReview = {
        ...oldReview,
        ...req.body,
        updatedAt: new Date(),
      };
      reviewsArray[index] = updatedReview;
      await writeReviews(reviewsArray);
      res.send(updatedReview);
    } else {
      next(
        createHttpError(404, `Review with id ${req.params.reviewId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

mediasRouter.delete("/:mediaId/reviews/:reviewId", async (req, res, next) => {
  try {
    const reviewsArray = await getReviews();
    const remainingReviews = reviewsArray.filter(
      (review) => review._id !== req.params.reviewId
    );
    if (reviewsArray.length !== remainingReviews.length) {
      await writeReviews(remainingReviews);
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Review with id ${req.params.reviewId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default mediasRouter;
