const { StatusCodes } = require("http-status-codes");
const UserModel = require("../../models/user/user.model");
const HttpException = require("../../utils/http.exception");
const { genSalt, hash, compare } = require("bcryptjs");
const { RoleNames } = require("../../utils/constants");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../utils/secrets");

class UserController {
  static SignUp = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new HttpException(
        StatusCodes.CONFLICT,
        "User Already exists with this email"
      );
    }

    const Salt = await genSalt(10);
    const hashedPassword = await hash(password, Salt);

    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: RoleNames.USER,
    });

    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "User Created Successfully" });
  };

  static SignIn = async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      throw new HttpException(StatusCodes.CONFLICT, "Wrong email or password");
    }

    const isMatch = await compare(password, existingUser.password);
    if (!isMatch) {
      throw new HttpException(StatusCodes.CONFLICT, "Wrong email or password");
    }

    const token = await jwt.sign({ user_id: existingUser._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Login successful", token });
  };

  static GetMe = async (req, res) => {
    const user = await UserModel.findById(req.user.user_id).select("-password");

    if (!user) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found");
    }
    return res.status(StatusCodes.OK).json({ user: user });
  };
}

module.exports = { UserController };
