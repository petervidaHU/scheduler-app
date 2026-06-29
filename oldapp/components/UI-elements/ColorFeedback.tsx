import React, { FC } from 'react'

interface props {
    color: string,
}

const ColorFeedback: FC<props> = ({color}) => {
  return (
    <div style={{
        backgroundColor: color,
        minWidth: '20px',
        maxWidth: '50px',
        minHeight: '20px',
        borderRadius: '10px',
    }}></div>
  )
}

export default ColorFeedback