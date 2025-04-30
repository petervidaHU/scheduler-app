import { Flex } from '@mantine/core'
import React, { FC } from 'react'

type props = {
    children: React.ReactNode,
    height: string,
}
const PlannerGridHeader: FC<props> = ({children, height}) => {
  return (
    <Flex
    wrap="wrap"
    direction="column"
    align="center"
    style={{
      height: `${height}`,
      overflow: "hidden",
    }}
  >
   {children}
  </Flex>
  )
}

export default PlannerGridHeader