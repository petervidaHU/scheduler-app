import { useStore } from "@/store/store";
import React, { FC } from "react";

const MINUTES_PER_ROW = 5;
const ROWS_PER_HOUR = 60 / MINUTES_PER_ROW;
const TOTAL_ROWS = 24 * ROWS_PER_HOUR;

const HourGrid: FC<{ onClickHandler?: (hour: number, minute?: number) => void }> = ({ onClickHandler }) => {
  const { windowHeight } = useStore();
  const rowHeight = windowHeight / TOTAL_ROWS;

  // Render hour labels (each label spans 12 rows)
  const hourLabels = Array.from({ length: 24 }, (_, hour) => (
    <div
      key={hour}
      style={{
        gridRow: `${hour * ROWS_PER_HOUR + 1} / span ${ROWS_PER_HOUR}`,
        gridColumn: 1,
        color: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "flex-start",
        padding: "2px 4px",
        fontSize: 12,
        borderBottom: "1px dashed rgba(0,0,0,0.1)",
        background: "rgba(240,240,245,0.3)",
        zIndex: 2,
      }}
    >
      {hour}:00
    </div>
  ));

  // Render 5-minute slots for click handling
  const slotDivs = Array.from({ length: TOTAL_ROWS }, (_, idx) => {
    const hour = Math.floor(idx / ROWS_PER_HOUR);
    const minute = (idx % ROWS_PER_HOUR) * MINUTES_PER_ROW;
    return (
      <div
        key={`slot-${idx}`}
        style={{
          gridRow: idx + 1,
          gridColumn: 2,
          borderBottom: "1px dashed rgba(0,0,0,0.05)",
          height: rowHeight,
          cursor: onClickHandler ? "pointer" : undefined,
        }}
        onClick={() => onClickHandler && onClickHandler(hour, minute)}
      />
    );
  });

  // Remove the outer grid container, just return hourLabels and slotDivs as fragments
  return <>{hourLabels}{slotDivs}</>;
};

export default HourGrid;
