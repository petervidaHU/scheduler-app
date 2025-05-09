import React, { FC } from "react";
import { Paper } from "@mantine/core";

interface props {
  children: React.ReactNode;
  windowHeight: number;
}

const GridContainer: FC<props> = ({ children, windowHeight }) => {
  return (
    <Paper
      withBorder
      p={0}
      style={{
        position: "relative",
        height: `${windowHeight}px`,
        overflow: "hidden",
      }}
    >
      {children}
    </Paper>
  );
};

export default GridContainer;
