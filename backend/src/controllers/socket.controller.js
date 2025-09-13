export default function socketController(io) {
  const boardStates = [];

  io.on("connection", (socket) => {
    socket.emit("load-board", boardStates);

    socket.on("start", (data) => {
      const newLine = { tool: data.tool, points: data.points };
      boardStates.push(newLine);
      io.emit("start", data);
    });

    socket.on("drawing", (data) => {
      const lastLine = boardStates[boardStates.length - 1];
      if (lastLine) {
        lastLine.points.push(data.x, data.y);
      }

      io.emit("drawing", data);
    });

    socket.on("end", () => {
      const lastLine = boardStates[boardStates.length - 1];
      if (lastLine) {
        lastLine.complete = true;
      }

      io.emit("end");
    });

    socket.on("disconnect", () => {});
  });
}
