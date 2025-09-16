import { io, Socket } from "socket.io-client";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Rect, Ellipse } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import {
  lineMouseDown,
  lineMouseMove,
  rectMouseDown,
  rectMouseMove,
  ellipseMouseDown,
  ellipseMouseMove,
} from "../lib/mouseEvents";

const url = "http://localhost:8000";
export const Route = createFileRoute("/")({
  component: socket,
});

function socket() {
  const socketRef = useRef<Socket | null>(null);
  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState<any[]>([]);
  const isDrawingRef = useRef(false);
  const [shapes, setShapes] = useState<any[]>([]);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(url);
    }
    socketRef.current.on("load-board", (boardStates: any[]) => {
      const loadedLines = boardStates.filter(
        (item) => item.tool === "pen" || item.tool === "eraser"
      );
      const loadedShapes = boardStates
        .filter((item) => item.type !== "pen" && item.type !== "eraser")
        .map((item) => ({ type: item.type, ...item }));
      console.log("loadedShapes", loadedShapes);
      setLines(loadedLines);
      setShapes(loadedShapes);
    });
    socketRef.current.on("start-line", (data: any) => {
      setLines((prev) => {
        const newLines = [...prev, { tool: data.tool, points: data.points }];
        return newLines;
      });
    });

    socketRef.current.on("drawing-line", (point) => {
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

    socketRef.current.on("start-rect", (data) => {
      setShapes((prev) => {
        return [
          ...prev,
          { type: data.tool, x: data.x, y: data.y, width: 0, height: 0 },
        ];
      });
    });

    socketRef.current.on("drawing-rect", (data) => {
      setShapes((prev) => {
        const lastShape = prev[prev.length - 1];
        if (!lastShape) return prev;
        const updatedShape = {
          ...lastShape,
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height,
        };
        return [...prev.slice(0, -1), updatedShape];
      });
    });

    socketRef.current.on("start-ellipse", (data) => {
      console.log("start-ellipse", data);
      setShapes((prev) => {
        return [
          ...prev,
          { type: data.tool, x: data.x, y: data.y, radiusX: 0, radiusY: 0 },
        ];
      });
    });

    socketRef.current.on("drawing-ellipse", (data) => {
      setShapes((prev) => {
        const lastShape = prev[prev.length - 1];
        if (!lastShape) return prev;
        const updatedShape = {
          ...lastShape,
          x: data.x,
          y: data.y,
          radiusX: data.radiusX,
          radiusY: data.radiusY,
        };
        console.log("updatedShape", updatedShape);
        return [...prev.slice(0, -1), updatedShape];
      });
    });

    socketRef.current.on("end-line", () => {});
  }, []);

  const mouseDown = (e: any) => {
    if (tool === "rectangle") {
      rectMouseDown(e, tool, setShapes, isDrawingRef, startPosRef, socketRef);
    }
    if (tool === "circle") {
      ellipseMouseDown(
        e,
        tool,
        setShapes,
        isDrawingRef,
        startPosRef,
        socketRef
      );
    }
    if (tool === "pen" || tool === "eraser") {
      lineMouseDown(e, isDrawingRef, setLines, socketRef, tool);
    }
  };

  const mouseMove = (e: any) => {
    if (tool === "rectangle") {
      rectMouseMove(e, shapes, setShapes, isDrawingRef, startPosRef, socketRef);
    }
    if (tool === "circle") {
      ellipseMouseMove(
        e,
        shapes,
        setShapes,
        isDrawingRef,
        startPosRef,
        socketRef
      );
    }
    if (tool === "pen" || tool === "eraser") {
      lineMouseMove(e, isDrawingRef, lines, setLines, socketRef);
    }
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    mouseDown(e);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    mouseMove(e);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    socketRef.current?.emit("end");
  };

  const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
    mouseDown(e);
  };

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    mouseMove(e);
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
        <option value="rectangle">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="drag">Drag</option>
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
          {lines.map((line, i) => {
            if (line.tool === "pen" || line.tool === "eraser") {
              return (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.tool === "eraser" ? "#fff" : "#df4b26"}
                  strokeWidth={5}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === "eraser" ? "destination-out" : "source-over"
                  }
                  draggable={tool === "drag"}
                />
              );
            }
            return null;
          })}
          {shapes.map((shape, i) => {
            if (shape.type === "rectangle") {
              return (
                <Rect
                  key={i}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  stroke="blue"
                  strokeWidth={2}
                  draggable={tool === "drag"}
                  fill={"rgba(0,0,0,0.1)"}
                />
              );
            }
            if (shape.type === "circle") {
              return (
                <Ellipse
                  key={i}
                  x={shape.x}
                  y={shape.y}
                  radiusX={shape.radiusX}
                  radiusY={shape.radiusY}
                  stroke={"green"}
                />
              );
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
}
