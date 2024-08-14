import React, { ReactNode } from 'react';

interface CardDataStatsProps {
    label: string;
    value: string;
}

const CardSmall: React.FC<CardDataStatsProps> = ({
    label,
    value,
}) => {
    return (
        <div className="rounded-sm border border-stroke bg-white py-4 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mt-4 flex items-end justify-between">
                <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                        {label}
                    </h4>
                    <span className="text-sm font-medium">{value}</span>
                </div>
            </div>
        </div>
    );
};

export default CardSmall;
