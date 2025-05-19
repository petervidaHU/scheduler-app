import { useStore } from "@/store/store";
import React, { FC } from "react";

// Helper function to calculate position based on time
const calculatePosition = (time: number, totalMinutes: number, totalHeight: number): number => {
  // Convert time (in minutes) to a fraction of the day
  const fraction = time / totalMinutes;
  // Convert the fraction to pixels
  return fraction * totalHeight;
};

const HourGrid: FC<{ onClickHandler?: (hour: number ) => void }> = ({ onClickHandler }) => {
  const { windowHeight } = useStore();
  
  // Total minutes in a day (24 hours * 60 minutes)
  const TOTAL_MINUTES = 24 * 60;

  const hourGrid = (id: string | null = null) => {
    return Array.from(new Array(24), (_, hour) => {
      // Convert hour to minutes
      const hourInMinutes = hour * 60;
      // Calculate position
      const slotTop = calculatePosition(hourInMinutes, TOTAL_MINUTES, windowHeight);
      // Calculate height of one hour
      const hourHeight = calculatePosition(60, TOTAL_MINUTES, windowHeight);

      return (
        <div
          key={hour}
          style={{
            color: "rgba(0, 0, 0, 0.5)",
            position: "absolute",
            top: `${slotTop}px`,
            height: `${hourHeight}px`,
            left: "5%",
            width: "90%",
            background: "rgba(240, 240, 245, 0.6)",
            borderBottom: "1px dashed rgba(0, 0, 0, 0.1)",
            padding: "2px 4px",
            boxSizing: "border-box",
          }}
          onClick={() => onClickHandler && onClickHandler(hour)}
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
