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

// Replace the old OverlapCIDREntry type with new type:
export type OverlapCIDREntry = {
    cidr: string;
    vpcId: string;
    vpcName: string;
    accountId: string;
    provider: string;
};

export type OverlapGroup = {
    entries: OverlapCIDREntry[];
    startIP: string;
    endIP: string;
};

export type CIDREntry = {
    provider: string;
    accountId: string;
    name: string; // still exists for other uses
    id: string;
    cidr: string;
};

// Updated compareCIDRsWithinList using union-find to group overlapping subnets
export function compareCIDRsWithinList(list: CIDREntry[]): OverlapGroup[] {
    // Precompute parsed info for valid CIDRs
    const parsedList = list.map((entry, idx) => {
         try {
             const parsed = parseCIDR(entry.cidr);
             return { index: idx, entry, parsed };
         } catch (e) {
             console.error(`Invalid CIDR at index ${idx}: ${entry.cidr}`);
             return null;
         }
    }).filter(x => x !== null) as { index: number, entry: CIDREntry, parsed: ReturnType<typeof parseCIDR> }[];

    const n = parsedList.length;
    // Initialize union-find structure
    const parent = Array(n).fill(0).map((_, i) => i);
    const find = (x: number): number => {
        if (parent[x] !== x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    };
    const union = (x: number, y: number) => {
        const rootX = find(x);
        const rootY = find(y);
        if (rootX !== rootY) {
            parent[rootY] = rootX;
        }
    };

    // Compare every pair; union if CIDRs overlap (i.e. intersection is non-empty)
    for (let i = 0; i < n; i++) {
        const pI = parsedList[i].parsed;
        for (let j = i + 1; j < n; j++) {
            const pJ = parsedList[j].parsed;
            const start = pI.network > pJ.network ? pI.network : pJ.network;
            const end = pI.broadcast < pJ.broadcast ? pI.broadcast : pJ.broadcast;
            if (start <= end) { // they overlap
                union(i, j);
            }
        }
    }

    // Group by root index
    const groupsMap: { [key: number]: number[] } = {};
    for (let i = 0; i < n; i++) {
        const root = find(i);
        if (!groupsMap[root]) {
            groupsMap[root] = [];
        }
        groupsMap[root].push(i);
    }

    const groups: OverlapGroup[] = [];
    // For each group with more than one member, compute the intersection range and list of entries (cidr and subnetId)
    for (const key in groupsMap) {
        const indices = groupsMap[key];
        if (indices.length > 1) {
            const entries = indices.map(i => ({
                 provider: parsedList[i].entry.provider,
                 accountId: parsedList[i].entry.accountId,
                 vpcName: parsedList[i].entry.name,
                 vpcId: parsedList[i].entry.id,
                 cidr: parsedList[i].entry.cidr,
            }));
            
            let groupStart = parsedList[indices[0]].parsed.network;
            let groupEnd = parsedList[indices[0]].parsed.broadcast;
            for (const i of indices) {
                const p = parsedList[i].parsed;
                if (p.network > groupStart) groupStart = p.network;
                if (p.broadcast < groupEnd) groupEnd = p.broadcast;
            }
            groups.push({
                entries,
                startIP: bigIntToIP(groupStart),
                endIP: bigIntToIP(groupEnd)
            });
        }
    }
    return groups;
}

export function flattenAndCompareCIDRs(list: CIDREntry[]): OverlapGroup[] {
    console.log("[flattenAndCompareCIDRs] Received list:", list);
    // Flatten each entry's comma-separated CIDRs.
    const flattened: CIDREntry[] = [];
    
    for (const entry of list) {
        const cidrParts = entry.cidr.split(',').map(s => s.trim()).filter(s => s);
        for (const cidr of cidrParts) {
            flattened.push({ ...entry, cidr });
        }
    }
    console.log("[flattenAndCompareCIDRs] Flattened list:", flattened);
    return compareCIDRsWithinList(flattened);
}

