import axios from "axios";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const userInfoUrl = `${process.env.ASGARDEO_BASE_URL}/oauth2/userinfo`;

    const response = await axios.get(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    req.user = response.data;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;