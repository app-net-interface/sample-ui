import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
// import Logo from '../../images/logo/logo.svg';
import Hamburger from "../../assets/images/hamburger.svg";
import SidebarNested from "./SidebarNested";
import { link } from "fs";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

/**
 * Sidebar component that displays a collapsible sidebar menu.
 * @param sidebarOpen - A boolean indicating whether the sidebar is open or closed.
 * @param setSidebarOpen - A function to toggle the sidebar open or closed.
 * @returns The Sidebar component.
 */

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  isSidebarVisible,
  toggleSidebarVisibility,
}: SidebarProps & {
  isSidebarVisible: boolean;
  toggleSidebarVisibility: () => void;
}) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  // Conditionally render the sidebar based on `isSidebarVisible`
  if (!isSidebarVisible) {
    return (
      <button
        onClick={toggleSidebarVisibility}
        className="fixed top-2 left-3 m-4"
        style={{ zIndex: 1000, pointerEvents: "auto" }}
      >
        <img src={Hamburger} className="dark:invert dark:brightness-200" alt="Menu" style={{ width: "4%", height: "4%" }} />
      </button>
    );
  }

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-80 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          {/* <img src={Logo} alt="Logo" /> */}
          <h1
            style={{
              fontSize: "3em",
              color: "white",
              fontWeight: "bold",
              paddingTop: "20px",
              paddingBottom: "5px",
            }}
          >
            ANI
          </h1>
          <p style={{ color: "#049FD9" }}>by Cisco</p>
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="px-1 lg:px-1">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              NETWORK
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <SidebarNested
                item={{
                  text: "Dashboard",
                  children: [
                    {
                      text: "Infrastructure Resources",
                      link: "/infra-resource-dashboard",
                    },
                    {
                      text: "IP Traffic (Connections)",
                      link: "/vpc-connection-dashboard",
                    },
                  ],
                }}
                pathname={pathname}
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
              />
              <SidebarNested
                item={{
                  text: "Infrastructure Resources",
                  children: [
                    {
                      text: "Cloud Resources",
                      link: "/multi-cloud-infra-resources",
                    },
                    {
                      text: "K8S Resources",
                      link: "/list-cluster-resources",
                    },
                  ],
                }}
                pathname={pathname}
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
              />
              <SidebarNested
                item={{
                  text: "Network Domain",
                  link: "/network-domain-1",
                  children: [
                    {
                      text: "Domains",
                      link: "/network-domain-domain-header",
                      children: [
                        {
                          text: "List",
                          link: "/network-domains",
                        },
                        {
                          text: "Create",
                          link: "/define-network-domain",
                        },
                      ],
                    },
                    {
                      text: "Connections",
                      link: "/network-domain-connection-header",
                      children: [
                        {
                          text: "List",
                          link: "/network-domain-connections",
                        },
                        {
                          text: "Create",
                          link: "/connection-creator",
                        },
                      ],
                    },
                  ],
                }}
                pathname={pathname}
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
              />
              <SidebarNested
                item={{
                  text: "Application",
                  link: "/application",
                  children: [
                    {
                      text: "Connections",
                      children: [
                        {
                          text: "List",
                          link: "/application-connections",
                        },
                        {
                          text: "Create",
                          link: "/application-connection-attachment",
                        },
                      ],
                    },
                  ],
                }}
                pathname={pathname}
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
              />
              <SidebarNested
                item={{
                  text: "User",
                  link: "/user",
                  children: [
                    {
                      text: "List",
                      link: "/user-list",
                    },
                    {
                      text: "Connections",
                      link: "/user-connections",
                      children: [
                        {
                          text: "List",
                          link: "/user-connections-policies",
                        },
                        {
                          text: "Create",
                          link: "/user-connection-attachment",
                        },
                      ],
                    },
                  ],
                }}
                pathname={pathname}
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
              />
              <SidebarNested
                item={{
                  text: "Endpoint",
                  link: "/endpoint",
                  children: [
                    {
                      text: "List",
                      link: "/endpoint-list",
                    },
                    {
                      text: "Connections",
                      link: "/endpoint-connections",
                      children: [
                        {
                          text: "List",
                          link: "/endpoint-connections-policies",
                        },
                        {
                          text: "Create",
                          link: "/application-connection-attachment",
                        },
                      ],
                    },
                    {
                      text: "Connection Policies",
                      link: "/endpoint-connection-policies",
                      children: [
                        {
                          text: "List",
                          link: "/endpoint-connections-policies",
                        },
                        {
                          text: "Create",
                          link: "/endpoint-connections-policies-creator",
                        },
                      ],
                    },
                  ],
                }}
                pathname={pathname}
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
              />
            </ul>
          </div>

          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              POLICY
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <SidebarNested
                item={{
                  text: "Connection",
                  children: [
                    {
                      text: "Workload Selection Policy",
                      link: "/applicationconnectionpolicies",
                      children: [
                        {
                          text: "List",
                          link: "/application-connection-policies",
                        },
                        {
                          text: "Create",
                          link: "/application-connection-creator",
                        },
                      ],
                    },
                    {
                      text: "SLO",
                      link: "/slo",
                      children: [
                        {
                          text: "List",
                          link: "/sla-profiles",
                        },
                        {
                          text: "Create",
                          link: "/sla-profile-creator",
                        },
                      ]
                    }
                  ],
                }}
                pathname={pathname}
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
              />
              <SidebarNested
                item={{
                  text: "Observability",
                  link: "/observability",
                  children: [
                    {
                      text: "Connection Monitoring Policy",
                      link: "/connection-monitoring-policy",
                      children: [
                        {
                          text: "List",
                          link: "/monitoring-policies",
                        },
                        {
                          text: "Create",
                          link: "/monitoring-policies-creator",
                        },
                      ],
                    },
                    {
                      text: "Connections Logging Policy",
                      link: "/connnection-logging-policy",
                      children: [
                        {
                          text: "List",
                          link: "/logging-policies",
                        },
                        {
                          text: "Create",
                          link: "/logging-policies-creator",
                        },
                      ],
                    },
                    {
                      text: "Metric Connection Policy",
                      link: "/metric-connection-policy",
                      children: [
                        {
                          text: "List",
                          link: "/network-domain-connections",
                        },
                        {
                          text: "Create",
                          link: "/connection-creator",
                        },
                      ],
                    },
                    {
                      text: "Alerting Policy",
                      link: "/alerting-policy",
                      children: [
                        {
                          text: "List",
                          link: "/sla-profiles",
                        },
                        {
                          text: "Create",
                          link: "/sla-profile-creator",
                        },
                      ],
                    },
                    {
                      text: "Packet Trading Policy",
                      link: "/packet-trading-policy",
                      children: [
                        {
                          text: "List",
                          link: "/sla-profiles",
                        },
                        {
                          text: "Create",
                          link: "/sla-profile-creator",
                        },
                      ],
                    },
                  ],
                }}
                pathname={pathname}
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
              />

              <SidebarNested
                item={{
                  text: "Security",
                  children: [
                    {
                      text: "Access Control Policy",
                      link: "/access-control-policy",
                      children: [
                        {
                          text: "List",
                          link: "/access-control-policies",
                        },
                        {
                          text: "Create",
                          link: "/access-control-policies-creator",
                        },
                      ],
                    },
                    {
                      text: "Geofencing Policy",
                      link: "/geofencing-policy",
                      children: [
                        {
                          text: "List",
                          link: "/geofencing-policies",
                        },
                        {
                          text: "Create",
                          link: "/geofencing-policies-creator",
                        },
                      ],
                    },
                    {
                      text: "Network Data Privacy Policy",
                      link: "/network-data-privacy-policy",
                      children: [
                        {
                          text: "List",
                          link: "/network-data-privacy-policies",
                        },
                        {
                          text: "Create",
                          link: "/network-data-privacy-policies-creator",
                        },
                      ],
                    },
                    {
                      text: "Traffic Inspection Policy",
                      link: "/traffic-inspection-policy",
                      children: [
                        {
                          text: "List",
                          link: "/traffic-inspection-policies",
                        },
                        {
                          text: "Create",
                          link: "/traffic-inspection-policies-creator",
                        },
                      ],
                    },
                  ],
                }}
                pathname={pathname}
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
              />
            </ul>
          </div>
        </nav>
      </div >
    </aside >
  );
};

export default Sidebar;
