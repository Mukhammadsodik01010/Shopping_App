const { Schema, model } = require("mongoose");
const { CollectionNames, RoleNames } = require("../../utils/constants");

const dacumentSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: [RoleNames.USER], default: RoleNames.USER },
    avatar: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const UserModel = model(
  CollectionNames.USER,
  dacumentSchema,
  CollectionNames.USER
);

module.exports = UserModel;
