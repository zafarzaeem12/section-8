import Joi from "joi";

export const designationValidator = Joi.object({
  title: Joi.string().required(),
});

export const notificationValidator = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
  userId: Joi.array(),
  allUser: Joi.boolean(),
});

export const aboutValidator = Joi.object({
  title: Joi.string().required(),
});
