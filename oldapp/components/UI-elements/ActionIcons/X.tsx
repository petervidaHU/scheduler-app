import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React, { FC, CSSProperties } from 'react'

interface props {
    onClickCallback: (...args: any[]) => void,
    label: string,
    style?: CSSProperties
}

const ActionIconX: FC<props> = ({
    onClickCallback,
    label,
    style
}) => {
  return (
    <ActionIcon
        onClick={onClickCallback}
        variant="filled"
        aria-label="Settings"
        style={style}
      >
        <IconTrash style={{ width: "70%", height: "70%" }} stroke={1.5} />
      </ActionIcon>
  )
}

export default ActionIconX