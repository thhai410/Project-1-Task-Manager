const tokenVerification = require("../../../middleware/token-verification/index").tokenVerification;

const getMe = async (req, res) => {
  try {
    // User data is set by tokenVerification middleware
    const user = req.user;

    if (!user) {
      return res.status(404).send({
        status: "FAILED",
        message: "User not found!",
      });
    }

    // Return user data without password
    return res.status(200).send({
      status: "SUCCESS",
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role?.toUpperCase() || "USER",
        last_login: user.last_login,
      },
    });
  } catch (e) {
    return res.status(500).send({
      status: "FAILED",
      message: e.message,
    });
  }
};

module.exports = [tokenVerification, getMe];