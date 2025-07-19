/**
 * Network related interfaces
 */

export interface NetworkResource {
    id: string;
    name?: string;
    accountId: string;
    region: string;
    provider: string;
    vpcId: string;
}

export interface VpcResource extends NetworkResource {
    ipv4?: string;
    compliant?: string;
    labels?: Record<string, string>;
}

export interface VmResource extends NetworkResource {
    type: string;
    subnetId: string;
    publicIp: string;
    privateIp: string;
    state: string;
    owner?: string;
    project?: string;
    labels: Record<string, string>;
    compliant: string;
    selfLink: string;
    securityGroups: string[];
    interfaceIds: string[];
    zone: string;
    createTime?: string;
    // Additional properties used in MultiCloudInfra.tsx
    creationTimestamp?: string;
    instanceType?: string;
    machineType?: string;
}

export interface SecurityGroupResource extends NetworkResource {
    type: string;
    ingressRules?: any[];
    egressRules?: any[];
}

export interface SubnetResource extends NetworkResource {
    cidr: string;
    availabilityZone?: string;
    state?: string;
}

export interface RouteTableResource extends NetworkResource {
    routes?: any[];
    associations?: any[];
}

export interface NetworkAclResource extends NetworkResource {
    inboundRules?: any[];
    outboundRules?: any[];
}

// Add an empty export if no other exports exist
export {};