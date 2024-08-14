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
import styles from "./application-connection-background.module.scss"
import transport from "@/assets/icons/transport.svg";
import insight from "@/assets/icons/insight.svg";
import network from "@/assets/icons/network.svg";
import security from "@/assets/icons/security.svg";

export const ApplicationConnectionBackground: FC = () => {
  return (
    <div className={styles.main} style={{ textAlign: "center" }}>
      <div className={styles.section}>
        <div className={styles.header}><h1>Application Connection</h1>
          <img alt={"application connection"} className={styles.img} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }} src={network}></img>
        </div>
        <p>An application connection provides connectivity for application components and attached resources distributed across networking domains like VPCs, VRFs, or VLANs. It ensures seamless communication, adhering to specific access policy and security measures.</p>
      </div>
      <div className={styles.section}>
        <div className={styles.header}><h1>Securing The Connection</h1></div>
        <img alt={"securing connection"} className={styles.img} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }} src={security}></img>
        <p>An application connection can be secured in the network through encryption, identity verification, and application segmentation policies to control traffic. An application flow traffic can be staged through firewalls and Intrusion Prevention Systems for additional protection. Adherance to industry-specific standards would create a robust security framework for your application connection.</p>
      </div>
      <div className={styles.section}>
        <div className={styles.header}><h1>Observing The Connection</h1></div>
        <img alt={"observing connection"} className={styles.img} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }} src={insight}></img>
        <p>Observability for an application connection, spanning across networking domains, entails monitoring key metrics such as traffic, latency, and error rates. You can write policies for these metrics to be continuously analyzed and visualized to detect anomalies and potential issues. This real-time insight will enable proactive management of the connection's performance, security, and health, ensuring seamless communication between various application components.</p>
      </div>
      <div className={styles.section}>
        <div className={styles.header}><h1>Connection Transport</h1></div>
        <img alt={"connection transport"} className={styles.img} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }} src={transport}></img>
        <p> Connection transport refers to the combination of routing technology and underlying network and routing infrastructure that ensures the Service Level Objectives (SLO) of the application connection are met. A network domain connection is a first class network tranport object that can be used to tranport application packets. By aligning with specific performance, reliability, and availability standards defined in the SLO, network domain connection serves as the backbone that guarantees the seamless and efficient communication required for the proper functioning of the connected applications.</p>
      </div>
    </div>
  );
};