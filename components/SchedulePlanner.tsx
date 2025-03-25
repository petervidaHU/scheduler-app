import React from 'react'
import DayPlanner from './DayPlanner'
interface props {
    numberOfDays: number,
    setter: (e: any) => void
}

const SchedulePlanner: React.FC<props> = ({
    numberOfDays,
    setter
}) => {

    const getDayPlanner = (numberofDays: number) => {
                return Array.from({length: numberofDays}, (_, index) => (
                    <div key={index}>
                        <h3>Day {index + 1}</h3>
                        <DayPlanner />
                    </div>
                ))
        
    }
  return (
    <div>{getDayPlanner(numberOfDays)}</div>
  )
}

export default SchedulePlanner