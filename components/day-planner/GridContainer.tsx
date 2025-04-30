import React, { FC } from "react";

interface props {
  children: React.ReactNode;
  windowHeight: number;
}

const GridContainer: FC<props> = ({ children, windowHeight }) => {
  return (
    <div
      style={{
        position: "relative",
        height: `${windowHeight}`,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};

export default GridContainer;
