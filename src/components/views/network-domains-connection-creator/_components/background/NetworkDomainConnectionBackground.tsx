/**
 * Copyright (c) 2024 Cisco Systems, Inc. and its affiliates
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http:www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC } from "react";
import styles from "./network-domain-connection-background.module.scss"
import transport from "@/assets/icons/transport.svg";
import insight from "@/assets/icons/insight.svg";
import network from "@/assets/icons/network.svg";
import security from "@/assets/icons/security.svg";

export const NetworkDomainConnectionBackground: FC = () => {
  return (
    <div className={styles.main}>
      <div className={styles.section}>
        <div className={styles.header}><h1>Inter Network Domain Connection</h1></div>
        <img alt={"application connection"} className={styles.img} src={network} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}></img>
        <p>An inter network domain connection provides connectivity and routing for network domains such as VPC,VRF and VLANs distributed across different cloud providers, data centers, campus and branch locations. It ensures seamless communication between two network domains, adhering to specific access policy and security measures, configured as part of this workflow.</p>
      </div>
      <div className={styles.section}>
        <div className={styles.header}><h1>Securing The Connection</h1></div>
        <img alt={"securing connection"} className={styles.img} src={security} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}></img>
        <p>An inter network domain connection can be secured in through encryption, identity, and traffic policies to inspect data packets flowing between the two. Traffic can be staged through firewalls and Intrusion Prevention(Detection) Systems to achieve this.</p>
      </div>
      <div className={styles.section}>
        <div className={styles.header}><h1>Observing The Connection</h1></div>
        <img alt={"observing connection"} className={styles.img} src={insight} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}></img>
        <p>Observability for an inter network domain connection, between two network domains, and spanning across on-premises or cloud providers, entails monitoring key metrics such as traffic, latency, and error rates. You can write policies for these metrics to be continuously analyzed and visualized to detect anomalies and potential issues. This real-time insight will enable proactive management of the connection's performance, security, and health, ensuring seamless communication across diverse environments.</p>
      </div>
      <div className={styles.section}>
        <div className={styles.header}><h1>Connection Transport</h1></div>
        <img alt={"connection transport"} className={styles.img} src={transport} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}></img>
        <p> Connection transport refers to the combination of routing technology and underlying network and routing infrastructure that ensures the Service Level Objectives (SLO) of the inter network domain connections are met. A network domain connection is a first class network tranport object that can be used to tranport packets across connected network domains. By aligning with specific performance, reliability, and availability standards defined in the network SLO, inter network domain connection serves as the backbone that guarantees the seamless and efficient communication required for the proper functioning of the connected applications.</p>
      </div>
    </div>
  );
};