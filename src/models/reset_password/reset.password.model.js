const { Schema, model } = require("mongoose");
const { CollectionNames } = require("../../utils/constants");

const dacumentSchema = new Schema(
  {
    verification_code: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expires: "3m" },
    },
    is_verified: { type: Boolean, default: false },
  },
  {
    versionKey: false,
  }
);

const Reset_password_schema = model(
  CollectionNames.RESET_PASSWORD,
  dacumentSchema,
  CollectionNames.RESET_PASSWORD
);

module.exports = Reset_password_schema;
