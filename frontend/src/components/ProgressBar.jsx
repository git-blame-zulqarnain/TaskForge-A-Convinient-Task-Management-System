import React from 'react';

const ProgressBar = ({ percentage, completedTasks, totalTasks }) => {
  const roundedPercentage = Math.round(percentage);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-info">
        <span>Task Progress</span>
        <span>{completedTasks} / {totalTasks} Completed ({roundedPercentage}%)</span>
      </div>
      <div className="progress-bar-background">
        <div
          className="progress-bar-foreground"
          style={{ width: `${roundedPercentage}%` }}
          role="progressbar"
          aria-valuenow={roundedPercentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;