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

module.exports = User_Router;
