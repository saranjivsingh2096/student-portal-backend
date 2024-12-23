const authController = require("../controllers/authController");
const authenticateToken = require("../middlewares/authenticateToken");

module.exports = (app) => {
  app.post("/login", authController.login);
  app.post("/logout", authenticateToken, authController.logout);
  app.get("/validate-token", authenticateToken, authController.validateToken);
};
