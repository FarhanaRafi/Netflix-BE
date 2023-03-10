import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";
const { readJSON, writeJSON } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
const mediaJSONPath = join(dataFolderPath, "media.json");
const reviewJSONPath = join(dataFolderPath, "reviews.json");

export const getMedia = () => readJSON(mediaJSONPath);
export const writeMedia = (mediaArray) => writeJSON(mediaJSONPath, mediaArray);
export const getReviews = () => readJSON(reviewJSONPath);
export const writeReviews = (reviewsArray) =>
  writeJSON(reviewJSONPath, reviewsArray);
