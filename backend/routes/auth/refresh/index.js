const jwt = require("jsonwebtoken");
const { findOne } = require("../../../helpers");
const Joi = require("joi");

const SECRET = process.env.TOKEN_SECRET;

// Validation schema
const schema = Joi.object({
  refreshToken: Joi.string().required(),
});

const refreshToken = async (req, res) => {
  try {
    // Validate input
    const validated = await schema.validateAsync(req.body);
    const { refreshToken } = validated;

    if (!SECRET) {
      return res.status(500).send({
        status: "FAILED",
        message: "Server error: SECRET is missing!",
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, SECRET);
    } catch (err) {
      return res.status(401).send({
        status: "FAILED",
        message: "Invalid or expired refresh token!",
      });
    }

    // Find user by email from token
    const user = await findOne("user", { email: decoded.email });

    if (!user) {
      return res.status(404).send({
        status: "FAILED",
        message: "User does not exist!",
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      SECRET,
      { expiresIn: "7d" }
    );

    // Response format
    return res.status(200).send({
      status: "SUCCESS",
      message: "Token refreshed successfully!",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (e) {
    return res.status(400).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = refreshToken;

