import React from 'react';
import { NavLink } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup'; // replace with actual import

const SidebarNested = ({ item, pathname, sidebarExpanded, setSidebarExpanded }) => {
    if (item.children && item.children.length > 0) {
        return (
            <SidebarLinkGroup
                activeCondition={
                    pathname === item.link || pathname.includes(item.link)
                }
            >
                {(handleClick, open) => (
                    <React.Fragment>
                        <NavLink
                            to="#"
                            className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === item.link ||
                                pathname.includes(item.link)) &&
                                'bg-graydark dark:bg-meta-4'
                                }`}
                            onClick={(e) => {
                                e.preventDefault();
                                sidebarExpanded
                                    ? handleClick()
                                    : setSidebarExpanded(true);
                            }}
                        >
                            {/* dropdown arrow */}
                            <svg
                                className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-180'
                                    }`}
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                                    fill=""
                                />
                            </svg>
                            {item.icon && <item.icon />}
                            {item.text}
                        </NavLink>
                        {/* <!-- Dropdown Menu Start --> */}
                        <div
                            className={`translate transform overflow-hidden ${!open && 'hidden'
                                }`}
                        >
                            <ul className="mt-1 mb-1 flex flex-col gap-2.5 pl-6">
                                {item.children.map((child, index) => (
                                    <ul key={index}>
                                        <SidebarNested
                                            item={child}
                                            pathname={pathname}
                                            sidebarExpanded={sidebarExpanded}
                                            setSidebarExpanded={setSidebarExpanded}
                                        />
                                    </ul>
                                ))}
                            </ul>
                        </div>
                        {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                )}
            </SidebarLinkGroup>
        );
    } else {
        return (
            <li>
                <NavLink
                    to={item.link}
                    className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === item.link) &&
                        'bg-graydark dark:bg-meta-4'
                        }`}
                >
                    {item.icon && <item.icon />}
                    {item.text}
                </NavLink>
            </li>
        );
    }
};

export default SidebarNested;