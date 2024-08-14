import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logs from '../../assets/icons/list.svg';

/**
 * DropdownNotification component.
 * 
 * This component displays a notification dropdown menu with a trigger button.
 * The dropdown menu opens when the trigger button is clicked and closes when the user clicks outside the dropdown or presses the escape key.
 * The component also includes a list of notifications that can be customized.
 */
const DropdownNotification = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifying, setNotifying] = useState(true);

    const trigger = useRef<any>(null);
    const dropdown = useRef<any>(null);

    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!dropdown.current) return;
            if (
                !dropdownOpen ||
                dropdown.current.contains(target) ||
                trigger.current.contains(target)
            )
                return;
            setDropdownOpen(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }: KeyboardEvent) => {
            if (!dropdownOpen || keyCode !== 27) return;
            setDropdownOpen(false);
        };
        document.addEventListener('keydown', keyHandler);
        return () => document.removeEventListener('keydown', keyHandler);
    });

    return (
        <li className="relative">
            <Link
                ref={trigger}
                onClick={() => {
                    setNotifying(false);
                    setDropdownOpen(!dropdownOpen);
                }}
                to="#"
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
                <span
                    className={`absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1 ${notifying === false ? 'hidden' : 'inline'
                        }`}
                >
                    <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
                </span>

                <img src={Logs} alt="logs" className="h-4 w-4 dark:invert dark:brightness-200" />
            </Link>

            <div
                ref={dropdown}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setDropdownOpen(false)}
                className={`absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80 ${dropdownOpen === true ? 'block' : 'hidden'
                    }`}
            >
                <div className="px-4.5 py-3">
                    <h5 className="text-sm font-medium text-bodydark2">Logs</h5>
                </div>
                <ul className="flex h-auto flex-col overflow-y-auto">
                    <li>
                        <Link
                            className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                            to="#"
                        >
                            <p className="text-sm">
                                <span className="text-black dark:text-white">
                                    Test Log
                                </span>{' '}
                                some service that was potentially requested is now offline.
                            </p>
                            <p className="text-xs">
                                {
                                    new Date('1970-01-01T15:40:00Z').toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: 'UTC',
                                        hour12: true
                                    })
                                } UST
                            </p>
                        </Link>
                    </li>
                </ul>
            </div>
        </li>
    );
};

export default DropdownNotification;
