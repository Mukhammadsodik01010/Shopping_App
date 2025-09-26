const { Router } = require("express");
const { UserController } = require("../../controllers/user/user.controller");
const { UserValidator } = require("../../validators/user/user.validator");
const expressValidator = require("../../validators");
const AuthMiddleware = require("../../middlewares/auth.middleware");

const User_Router = Router();

User_Router.post(
  "/sign-up",
  UserValidator.SignUp(),
  expressValidator,
  UserController.SignUp
);
User_Router.post(
  "/sign-in",
  UserValidator.SignIn(),
  expressValidator,
  UserController.SignIn
);
User_Router.get("/get-me", AuthMiddleware, UserController.GetMe);

User_Router.post(
  "/forget-password",
  UserValidator.ForgetPassword(),
  expressValidator,
  UserController.ForgetPassword
);
User_Router.post(
  "/verify-code",
  UserValidator.VerifyCode(),
  expressValidator,
  UserController.VerifyCode
);
User_Router.post(
  "/reset-password",
  UserValidator.ResetPassword(),
  expressValidator,
  UserController.ResetPassword
);

module.exports = User_Router;
