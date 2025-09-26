const { StatusCodes } = require("http-status-codes");
const UserModel = require("../../models/user/user.model");
const HttpException = require("../../utils/http.exception");
const { genSalt, hash, compare } = require("bcryptjs");
const { RoleNames } = require("../../utils/constants");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../utils/secrets");
const { sendMail } = require("../../utils/nodemailer");
const Reset_password_schema = require("../../models/reset_password/reset.password.model");

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

  static ForgetPassword = async (req, res) => {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Email is not registered yet"
      );
    }

    const verification_code = Math.floor(100000 + Math.random() * 900000);

    await sendMail(
      email,
      "Password Reset",
      `Your verification code is <${verification_code}>`
    );

    await Reset_password_schema.create({
      verification_code,
      email,
      expires_at: new Date(Date.now() + 3 * 60 * 1000),
    });

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Verification code sent to email" });
  };

  static VerifyCode = async (req, res) => {
    const { email, verification_code } = req.body;

    const user = await Reset_password_schema.findOne({ email });
    if (!user) {
      throw new HttpException(StatusCodes.BAD_GATEWAY, "Invalid verification");
    }

    if (user.is_verified) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Verification code alredy used"
      );
    }

    if (user.verification_code !== verification_code) {
      throw new HttpException(StatusCodes.BAD_GATEWAY, "Invalid verification");
    }

    user.is_verified = true;
    await user.save();

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Verification successfull" });
  };

  static ResetPassword = async (req, res) => {
    const { email, password } = req.body;

    const record = await Reset_password_schema.findOne({ email });
    if (!record || !record.is_verified) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "Email not verified fot password reset"
      );
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found");
    }

    const SaltNumber = await genSalt(10);
    const hashedPassword = await hash(password, SaltNumber);

    user.password = hashedPassword;
    await user.save();

    await Reset_password_schema.deleteMany({ email });

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Password reset successfully" });
  };
}

module.exports = { UserController };
