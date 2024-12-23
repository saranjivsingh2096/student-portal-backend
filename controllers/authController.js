const jwt = require("jsonwebtoken");
const { User } = require("../models");

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username, password } });

    if (user) {
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.status(200).json({ authToken: token });
    } else {
      return res.status(401).json({ message: "Incorrect username or password." });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to login." });
  }
};

const logout = (req, res) => {
  return res.status(200).json({ message: "Logged out successfully." });
};

const validateToken = (req, res) => {
  return res.status(200).json({ message: "Token is valid.", user: req.user });
};

module.exports = { login, logout, validateToken };
