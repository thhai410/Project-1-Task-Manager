const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET } = require("../../../config");
const { insertNewDocument, findOne } = require("../../../helpers");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
    .required(),
  address: Joi.string(),
  info: Joi.string(),
  role: Joi.string().valid("admin", "user", "member").default("user"),
});


const signUpUser = async (req, res) => {
  try {
    // Validate input
    const validated = await schema.validateAsync(req.body);

    const { email, username, password } = validated;

    // Check email exists
    const checkEmail = await findOne("user", { email });
    if (checkEmail) {
      return res.status(409).send({
        status: "FAILED",
        message: "Email already exists!",
      });
    }

    // Check username exists
    const checkUsername = await findOne("user", { username });
    if (checkUsername) {
      return res.status(409).send({
        status: "FAILED",
        message: "Username already exists!",
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    // Create new user object
    const new_user = {
      ...validated,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      status: "Active",
    };

    // Insert to DB
    const user = await insertNewDocument("user", new_user);

    // Generate token (optional)
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });

    // Response format (EXACT like anh gửi)
    return res.status(200).send({
      status: "SUCCESS",
      message: "Signup successful!",
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        accessToken: token,
        refreshToken: token, // Same for now
        role: user.role?.toUpperCase() || "USER",
      },
    });
  } catch (e) {
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = signUpUser;