import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const mediaSchema = {
  type: {
    in: ["body"],
    isString: {
      errorMessage: "Type is a mandatory and needs to be in string",
    },
  },
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory and needs to be in string",
    },
  },
  year: {
    in: ["body"],
    isNumeric: {
      errorMessage: "Year is a mandatory and needs to be in number",
    },
  },
};

export const checkMediaSchema = checkSchema(mediaSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);

  console.log(errors.array());

  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, "Errors during Media validation", {
        errorsList: errors.array(),
      })
    );
  }
};
