const authController = require("../controllers/authController");
const authenticateToken = require("../middlewares/authenticateToken");

module.exports = (app) => {
  app.post("/auth/login", authController.login);
  app.post("/auth/logout", authenticateToken, authController.logout);
  app.post("/auth/validate-token", authenticateToken, authController.validateToken);
};
