import Joi from "joi";
export const deviceRequired = {
  //test the given deviceToken
  deviceToken: Joi.string().required(),
  deviceType: Joi.string().required().equal("android", "ios", "postman"),
};
export const IdValidator = Joi.object({
  id: Joi.string().min(24).max(24),
});
export const RegisterUserValidator = Joi.object({
  email: Joi.string().email().required(),
});
export const forgetpasswordValidator = Joi.object({
  email: Joi.string().email().required(),
});
export const LoginUserValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  deviceType: Joi.string().required(),
  deviceToken: Joi.string().required(),
});

export const changePasswordValidator = Joi.object({
  old_password: Joi.string().required(),
  new_password: Joi.string().required(),
});

export const updatevalidator = Joi.object({
  phone: Joi.string().allow(null),
  location: Joi.string().allow(null),
  address: Joi.string().allow(null),
  // long:joi.number(),
  // lat:joi.number(),
  bio: Joi.string().allow(null),
  fullname: Joi.string().allow(null),
  designation: Joi.string().allow(null),
  password: Joi.string().allow(null),
  name: Joi.string().allow(null),
  facebookId: Joi.string().allow(null),
  instgramId: Joi.string().allow(null),
  notificationOn: Joi.boolean(),
});

export const createprofilevalidator = Joi.object({
  email: Joi.string().required(),
  phone: Joi.string().allow(null),
  location: Joi.string().allow(null),
  //long:joi.number(),
  // lat:joi.number(),
  designation: Joi.string().allow(null),
  password: Joi.string().allow(null),
  name: Joi.string().required(),
  deviceType: Joi.string().required(),
  deviceToken: Joi.string().required(),
});

export const verifyOTPValidator = Joi.object({
  otp: Joi.string().required(),
  ...deviceRequired,
});

export const ResetPasswordValidator = Joi.object({
  password: Joi.string().required(),
  ...deviceRequired,
});

export const formValidator = Joi.object({
  phone: Joi.string().allow(null),
  name: Joi.string().allow(null),
  email: Joi.string().email().required(),
  message: Joi.string().allow(null),
});

export const reviewValidator = Joi.object({
  propertyID: Joi.string().required(),
  message: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
});
