export default function socketController(io) {
  const boardStates = [];

  io.on("connection", (socket) => {
    socket.emit("load-board", boardStates);

    socket.on("start-line", (data) => {
      const newLine = { tool: data.tool, points: data.points };
      boardStates.push(newLine);
      io.emit("start", data);
    });

    socket.on("start-rect", (data) => {
      const newRect = {
        type: data.tool,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        complete: false,
      };
      boardStates.push(newRect);
      console.log("Rect start", boardStates);
      io.emit("start-rect", data);
    });

    socket.on("drawing-line", (data) => {
      const lastLine = boardStates[boardStates.length - 1];
      if (lastLine) {
        lastLine.points.push(data.x, data.y);
      }
      io.emit("drawing-line", data);
    });

    socket.on("drawing-rect", (data) => {
      const lastRect = boardStates.findLast(
        (item) => item.type === "rectangle" && !item.complete
      );
      console.log("Rect drawing", lastRect, data);
      if (lastRect) {
        lastRect.x = data.x;
        lastRect.y = data.y;
        lastRect.width = data.width;
        lastRect.height = data.height;
      }
      io.emit("drawing-rect", data);
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
