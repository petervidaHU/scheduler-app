import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React, { FC } from 'react'

 interface props {
    onClickCallback: (...args: any[]) => void,
    label: string
 }

const ActionIconX: FC<props> = ({
    onClickCallback,
    label,
}) => {
  return (
    <ActionIcon
        onClick={onClickCallback}
        variant="filled"
        aria-label="Settings"
      >
        <IconTrash style={{ width: "70%", height: "70%" }} stroke={1.5} />
      </ActionIcon>
  )
}

export default ActionIconX