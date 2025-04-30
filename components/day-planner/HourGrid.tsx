import { useStore } from "@/store/store";
import React from "react";

const HourGrid = () => {
  const { windowHeight } = useStore();

  const hourGrid = (id: string | null = null) => {
    return Array.from(new Array(24), (_, hour) => {
      const slotTop = (windowHeight / 24) * hour;
      return (
        <div
          key={hour}
          style={{
            position: "absolute",
            top: `${slotTop}px`,
            height: `${windowHeight / 24}px`,
            left: "5%",
            width: "90%",
            background: "rgba(85, 199, 81, 0.2)",
            padding: "2px 4px",
            boxSizing: "border-box",
          }}
        >
          {hour}:00
        </div>
      );
    });
  };
  return (
    <div
      style={{
        position: "relative",
        height: `${windowHeight}px`,
        overflow: "hidden",
      }}
    >
      {hourGrid()}
    </div>
  );
};

export default HourGrid;
