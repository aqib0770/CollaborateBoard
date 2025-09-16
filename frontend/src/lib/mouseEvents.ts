export const getPointerPosition = (e: any) => {
  const stage = e.target.getStage();
  if (!stage) return null;
  const point = stage.getPointerPosition();
  if (!point) return null;
  return point;
};

export const lineMouseDown = (
  e: any,
  isDrawingRef: React.MutableRefObject<boolean>,
  setLines: any,
  socketRef: React.MutableRefObject<any>,
  tool: string = "pen"
) => {
  isDrawingRef.current = true;
  const point = getPointerPosition(e);
  setLines((prev: any) => {
    if (!point) return prev;
    const newLines = [...prev, { tool: tool, points: [point.x, point.y] }];
    return newLines;
  });
  socketRef.current?.emit("start-line", {
    tool: tool,
    points: [point?.x, point?.y],
  });
};

export const lineMouseMove = (
  e: any,
  isDrawingRef: React.MutableRefObject<boolean>,
  lines: any,
  setLines: any,
  socketRef: React.MutableRefObject<any>
) => {
  if (!isDrawingRef.current) return;
  const point = getPointerPosition(e);
  if (!point) return;
  let lastLine = lines[lines.length - 1];
  if (!lastLine) return;
  lastLine.points = lastLine.points.concat([point.x, point.y]);
  lines.splice(lines.length - 1, 1, lastLine);
  setLines(lines.concat());
  socketRef.current?.emit("drawing-line", { x: point.x, y: point.y });
};

export const rectMouseDown = (
  e: any,
  tool: string,
  setShapes: any,
  isDrawingRef: any,
  startPosRef: any,
  socketRef?: React.MutableRefObject<any>
) => {
  isDrawingRef.current = true;
  const point = getPointerPosition(e);
  if (!point) return;
  startPosRef.current = point;
  setShapes((prev: any) => {
    return [
      ...prev,
      { type: tool, x: point.x, y: point.y, width: 0, height: 0 },
    ];
  });
  if (socketRef?.current) {
    socketRef.current?.emit("start-rect", {
      tool: tool,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
    });
  }
};

export const rectMouseMove = (
  e: any,
  shapes: any,
  setShapes: any,
  isDrawingRef: any,
  startPosRef: any,
  socketRef?: React.MutableRefObject<any>
) => {
  if (!isDrawingRef.current) return;
  const point = getPointerPosition(e);
  if (!point) return;
  const startPosX = startPosRef.current.x;
  const startPosY = startPosRef.current.y;
  const newWidth = point.x - startPosX;
  const newHeight = point.y - startPosY;
  let lastShape = shapes[shapes.length - 1];
  if (!lastShape) return;
  lastShape.width = newWidth;
  lastShape.height = newHeight;
  shapes.splice(shapes.length - 1, 1, lastShape);
  setShapes(shapes.concat());
  if (socketRef?.current) {
    socketRef.current?.emit("drawing-rect", {
      x: startPosX,
      y: startPosY,
      width: newWidth,
      height: newHeight,
    });
  }
};

export const ellipseMouseDown = (
  e: any,
  tool: string,
  setShapes: any,
  isDrawingRef: any,
  startPosRef: any,
  socketRef?: React.MutableRefObject<any>
) => {
  isDrawingRef.current = true;
  const point = getPointerPosition(e);
  if (!point) return;
  startPosRef.current = point;
  setShapes((prev: any) => {
    return [
      ...prev,
      { type: tool, x: point.x, y: point.y, radiusX: 0, radiusY: 0 },
    ];
  });
  if (socketRef?.current) {
    socketRef.current?.emit("start-ellipse", {
      tool: tool,
      x: point.x,
      y: point.y,
      radiusX: 0,
      radiusY: 0,
    });
  }
};

export const ellipseMouseMove = (
  e: any,
  shapes: any,
  setShapes: any,
  isDrawingRef: any,
  startPosRef: any,
  socketRef?: React.MutableRefObject<any>
) => {
  if (!isDrawingRef.current) return;
  const point = getPointerPosition(e);
  if (!point) return;
  const startPosX = startPosRef.current.x;
  const startPosY = startPosRef.current.y;
  const newRadiusX = Math.abs(point.x - startPosX);
  const newRadiusY = Math.abs(point.y - startPosY);
  let lastShape = shapes[shapes.length - 1];
  if (!lastShape) return;
  lastShape.radiusX = newRadiusX;
  lastShape.radiusY = newRadiusY;
  shapes.splice(shapes.length - 1, 1, lastShape);
  setShapes(shapes.concat());
  if (socketRef?.current) {
    socketRef.current?.emit("drawing-ellipse", {
      x: startPosX,
      y: startPosY,
      radiusX: newRadiusX,
      radiusY: newRadiusY,
    });
  }
};
