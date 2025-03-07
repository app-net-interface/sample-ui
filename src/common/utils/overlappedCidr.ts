
export type OverlapDetail = {
    sourceCIDR: string;
    destinationCIDR: string;
    overlapRange?: string; // Not computed in this example.
    startIP: string;
    endIP: string;
};

export function ipToBigInt(ip: string): bigint {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
        throw new Error(`Invalid IP address: ${ip}`);
    }
    // Combine 4 parts into a 32-bit number.
    return BigInt((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]);
}

export function bigIntToIP(val: bigint): string {
    const num = Number(val);
    const part1 = (num >> 24) & 0xff;
    const part2 = (num >> 16) & 0xff;
    const part3 = (num >> 8) & 0xff;
    const part4 = num & 0xff;
    return `${part1}.${part2}.${part3}.${part4}`;
}

type ParsedCIDR = {
    ip: string;
    mask: number;
    ipNum: bigint;
    network: bigint;
    broadcast: bigint;
};

export function parseCIDR(cidr: string): ParsedCIDR {
    const parts = cidr.split("/");
    if (parts.length !== 2) {
        throw new Error(`Invalid CIDR: ${cidr}`);
    }
    const ip = parts[0];
    const mask = parseInt(parts[1], 10);
    if (isNaN(mask) || mask < 0 || mask > 32) {
        throw new Error(`Invalid mask in CIDR: ${cidr}`);
    }
    const ipNum = ipToBigInt(ip);
    // For IPv4, compute the mask. For mask = 0, special case.
    const maskBits = mask === 0 ? BigInt(0) : ((BigInt(0xffffffff) << BigInt(32 - mask)) & BigInt(0xffffffff));
    const network = ipNum & maskBits;
    const broadcast = network | (~maskBits & BigInt(0xffffffff));
    return { ip, mask, ipNum, network, broadcast };
}

export function validateCIDR(cidr: string): boolean {
    try {
        const parsed = parseCIDR(cidr);
        // Normalize: reconstruct the CIDR from the computed network.
        const normalized = `${bigIntToIP(parsed.network)}/${parsed.mask}`;
        return cidr === normalized;
    } catch (e) {
        return false;
    }
}

/**
 * Determines the overlapping IP range between two CIDRs.
 * It computes:
 *   start = max(network1, network2)
 *   end = min(broadcast1, broadcast2)
 * Returns null if there is no overlap.
 */
export function findOverlappingRange(
    cidrStr1: string,
    cidrStr2: string
): { overlapRange?: string; startIP: string; endIP: string } | null {
    try {
        const c1 = parseCIDR(cidrStr1);
        const c2 = parseCIDR(cidrStr2);
        const start = c1.network > c2.network ? c1.network : c2.network;
        const end = c1.broadcast < c2.broadcast ? c1.broadcast : c2.broadcast;
        if (start > end) {
            return null;
        }
        // For now, we do not compute a minimal covering CIDR so overlapRange remains undefined.
        return { startIP: bigIntToIP(start), endIP: bigIntToIP(end) };
    } catch (e) {
        return null;
    }
}

export function compareCIDRLists(list1: string[], list2: string[]): OverlapDetail[] {
    let overlaps: OverlapDetail[] = [];
    for (let cidr1 of list1) {
        if (!validateCIDR(cidr1)) {
            console.error(`Invalid CIDR in list1: ${cidr1}`);
            continue;
        }
        for (let cidr2 of list2) {
            if (!validateCIDR(cidr2)) {
                console.error(`Invalid CIDR in list2: ${cidr2}`);
                continue;
            }
            const overlap = findOverlappingRange(cidr1, cidr2);
            if (overlap) {
                overlaps.push({
                    sourceCIDR: cidr1,
                    destinationCIDR: cidr2,
                    startIP: overlap.startIP,
                    endIP: overlap.endIP
                });
            }
        }
    }
    return overlaps;
}

export function compareCIDRsWithinList(list: string[]): OverlapDetail[] {
    let overlaps: OverlapDetail[] = [];
    for (let i = 0; i < list.length; i++) {
        if (!validateCIDR(list[i])) {
            console.error(`Invalid CIDR: ${list[i]}`);
            continue;
        }
        for (let j = i + 1; j < list.length; j++) {
            if (!validateCIDR(list[j])) {
                console.error(`Invalid CIDR: ${list[j]}`);
                continue;
            }
            const overlap = findOverlappingRange(list[i], list[j]);
            if (overlap) {
                overlaps.push({
                    sourceCIDR: list[i],
                    destinationCIDR: list[j],
                    startIP: overlap.startIP,
                    endIP: overlap.endIP
                });
            }
        }
    }
    return overlaps;
}

