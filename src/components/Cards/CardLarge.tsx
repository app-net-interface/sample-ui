import React, { ReactNode } from 'react';

interface CardDataStatsProps {
    label: string;
    value: string | number;
}

interface CardLargeProps {
    title: string;
    data: CardDataStatsProps[];
}

const CardLarge: React.FC<CardLargeProps> = ({ title, data }) => {
    return (
        <div className="rounded-sm border border-stroke bg-white py-4 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark grid grid-cols-4 gap-4">
            <div className="col-span-4 text-left">
                <h3 className="text-2xl font-bold mt-2 text-black dark:text-white">{title}</h3>
            </div>
            {data.map((item, index) => (
                <div key={index} className="mt-1 flex items-end justify-between">
                    <div>
                        <h4 className="text-title-md text-gray-700 dark:text-white">
                            {item.label}
                        </h4>
                        <span className="text-xl text-black dark:text-white">{item.value}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CardLarge;