import axios from "axios";

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const userInfoUrl = `${process.env.ASGARDEO_BASE_URL}/oauth2/userinfo`;

    const response = await axios.get(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.user = response.data;
    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Invalid or expired token"));
  }
};

export default socketAuthMiddleware;