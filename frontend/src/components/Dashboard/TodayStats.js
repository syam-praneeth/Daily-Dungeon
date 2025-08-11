import React, { useContext, useEffect } from "react";
import { TimerContext } from "../../context/TimerContext";

const TodayStats = () => {
  const { readingToday, fetchToday } = useContext(TimerContext);
  useEffect(() => {
    fetchToday();
  }, []);
  return (
    <div style={{ margin: "1rem 0" }}>
      <strong>Today's Reading Time:</strong> {Math.floor(readingToday / 60)} min{" "}
      {readingToday % 60} sec
    </div>
  );
};

export default TodayStats;
