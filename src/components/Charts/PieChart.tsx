import { ApexOptions } from 'apexcharts';
import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

interface PieChartState {
  title: string;
  series: number[];
}

const options: ApexOptions = {
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    type: 'donut',
  },
  colors: ['#37A2EB', '#FF6384', '#3F6385'],
  labels: ['Running', 'Stopped', 'Terminated'],
  legend: {
    show: true,
    position: 'bottom',
    offsetY: 0,
    offsetX: 0,
  },

  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        background: 'transparent',
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
};

const PieChart: React.FC<PieChartState> = ({ title, series }) => {
  const [state, setState] = useState<PieChartState>({
    title,
    series,
  });

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      series,
    }));
  };
  handleReset;

  return (
    <div className="sm:px-7.5 col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-2xl font-semibold text-black dark:text-white">
            {title}
          </h5>
        </div>
      </div>

      <div className="mb-2 h-64">
        <div id="PieChart" className="flex justify-center">
          {state.series.every(value => value === 0) ? (
            <p className="text-lg mt-32">There are currently no running, stopped, or terminated states.</p>
          ) : (
            <ReactApexChart
              options={options}
              series={state.series}
              type="donut"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
