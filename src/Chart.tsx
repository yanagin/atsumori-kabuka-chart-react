import * as React from "react";
import { Line } from "react-chartjs-2";

type Props = {
  onElementsClick?: (data: any) => void;
  data: any;
  options: any;
};

const Chart = (props: Props) => {
  return (
    <div className='chart'>
      <Line data={props.data} options={props.options} onElementsClick={props.onElementsClick} />
    </div>
  );
};

export default Chart;