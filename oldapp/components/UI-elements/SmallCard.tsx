import { Card } from "@mantine/core";
import React, { FC } from "react";

interface props {
  name: string;
  description: string;
}

const SmallCard: FC<props> = ({ name, description }) => {
  return (
    <Card>
      <Card.Section>
        <p>{name}</p>
        <p>{description}</p>
      </Card.Section>
    </Card>
  );
};

export default SmallCard;
