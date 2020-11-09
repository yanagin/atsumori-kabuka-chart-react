import * as React from "react";
import { Line } from "react-chartjs-2";

const Chart = (props) => {
  return (
    <div className='chart'>
      <Line data={props.data} options={props.options} onElementsClick={props.onElementsClick} />
    </div>
  );
};

export default Chart;