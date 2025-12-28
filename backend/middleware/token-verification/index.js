const jwt = require("jsonwebtoken");
const Config = require("../../config/db");
const { getDbUserData, findOne } = require("../../helpers");

const tokenVerification = async (req, res, next) => {
  // Express normalizes headers to lowercase
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send({
      status: "FAILED",
      message: "No token provided!",
    });
  }

  const SECRET = process.env.TOKEN_SECRET;

  if (!SECRET) {
    return res.status(500).send({
      status: "FAILED",
      message: "Server configuration error: SECRET is missing!",
    });
  }

  jwt.verify(token, SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).send({
        status: "FAILED",
        message: "Token unauthorized!",
      });
    }

    // decoded đã chứa id + email từ loginUser
    const user = await findOne("user", { email: decoded.email });

    if (!user) {
      return res.status(404).send({
        status: "FAILED",
        message: "User does not exist.",
      });
    }

    // Gắn user id vào request để controller sử dụng
    req.userId = user._id.toString(); // Use _id
    req.role = user.role;
    req.user = user; // Add full user object

    console.log("Token verified successfully for user:", user.email); 
    console.log("User ID from token:", req.userId);
    console.log("User Role from token:", req.role);
    next();
  });
};

module.exports = { tokenVerification: tokenVerification };