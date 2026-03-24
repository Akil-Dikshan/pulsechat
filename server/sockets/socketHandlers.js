const userSocketMap = {};

export const getSocketId = (asgardeoId) => {
  return userSocketMap[asgardeoId];
};

const initSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const { sub, username } = socket.user;

    console.log(`User connected: ${username || sub} (socket: ${socket.id})`);

    userSocketMap[sub] = socket.id;
    console.log("Online users:", Object.keys(userSocketMap).length);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${username || sub} (socket: ${socket.id})`);

      delete userSocketMap[sub];
      console.log("Online users:", Object.keys(userSocketMap).length);
    });
  });
};

export default initSocketHandlers;