import { io, Socket } from "socket.io-client";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";

const url = "http://localhost:8000";
export const Route = createFileRoute("/")({
  component: socket,
});

function socket() {
  const socketRef = useRef<Socket | null>(null);
  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState<any[]>([]);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(url);
    }
    socketRef.current.on("load-board", (boardStates: any[]) => {
      console.log("Loading board states:", boardStates);
      setLines([...boardStates]);
      console.log("Current lines state:", lines);
    });
    socketRef.current.on("start", (data: any) => {
      setLines((prev) => {
        const newLines = [...prev, { tool: data.tool, points: data.points }];
        return newLines;
      });
    });

    socketRef.current.on("drawing", (point) => {
      setLines((prev) => {
        const lastLine = prev[prev.length - 1];
        if (!lastLine) return prev;
        const updatedLine = {
          ...lastLine,
          points: [...lastLine.points, point.x, point.y],
        };
        return [...prev.slice(0, -1), updatedLine];
      });
    });

    socketRef.current.on("end-line", () => {});
  }, []);

  const MouseMove = (e: any) => {
    if (!isDrawingRef.current) {
      return;
    }
    const stage = e.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    if (!point || !lastLine) return;
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
    socketRef.current?.emit("drawing", { x: point.x, y: point.y });
  };

  const MouseDown = (e: any) => {
    isDrawingRef.current = true;
    const stage = e.target?.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    socketRef.current?.emit("start", { tool, points: [pos.x, pos.y] });
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    MouseDown(e);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    MouseMove(e);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    socketRef.current?.emit("end");
  };

  const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
    MouseDown(e);
  };

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    MouseMove(e);
  };

  return (
    <div>
      <select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
      </select>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
