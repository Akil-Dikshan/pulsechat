const initSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const { sub, username } = socket.user;

    console.log(`User connected: ${username || sub} (socket: ${socket.id})`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${username || sub} (socket: ${socket.id})`);
    });
  });
};

export default initSocketHandlers;