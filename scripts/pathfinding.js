class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    push(node) {
        this.heap.push(node);
        this.bubble_up(this.heap.length - 1);
    }

    pop() {
        if (this.size() === 0) return null;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this.sink_down(0);
        }
        return top;
    }

    size() {
        return this.heap.length;
    }

    bubble_up(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.heap[idx].f >= this.heap[parentIdx].f) break;
            [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
            idx = parentIdx;
        }
    }

    sink_down(idx) {
        const length = this.heap.length;
        while (true) {
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            let smallest = idx;

            if (left < length && this.heap[left].f < this.heap[smallest].f) smallest = left;
            if (right < length && this.heap[right].f < this.heap[smallest].f) smallest = right;
            if (smallest === idx) break;

            [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
            idx = smallest;
        }
    }
}

function octileDistance(a, b) {
    const dx = Math.abs(a.i - b.i);
    const dy = Math.abs(a.j - b.j);
    const D = 1;
    const D2 = Math.SQRT2;
    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
}

function nodeKey(i, j, k) {
    return `${i},${j},${k}`;
}

function reconstructPath(node) {
    const path = [];
    let current = node;
    while (current) {
        path.push({ i: current.i, j: current.j, k: current.k });
        current = current.parent;
    }
    return path.reverse();
}

function getAdjacentCoordinates(node, allowDiagonal) {
    const directions = allowDiagonal
        ? [
            { i: 1, j: 0 }, { i: -1, j: 0 }, { i: 0, j: 1 }, { i: 0, j: -1 },
            { i: 1, j: 1 }, { i: 1, j: -1 }, { i: -1, j: 1 }, { i: -1, j: -1 }
        ]
        : [
            { i: 1, j: 0 }, { i: -1, j: 0 }, { i: 0, j: 1 }, { i: 0, j: -1 }
        ];

    return directions.map(d => ({ i: node.i + d.i, j: node.j + d.j }));
}

/*
    Modern A* Spatial Pathfinding Solver
    @param {Object} start - {i, j, k}
    @param {Object} target - {i, j, k}
    @param {Object} grid - Abstraction layer exposing getTopZ(i,j) and isTraversable(i,j,k)
    @param {Object} options - Pathfinding settings
    Currently unused
*/
export function find_path(start, target, grid, options = {}) {
    const {
        allowDiagonal = true,
        maxSearch = 2000,
        returnNextStep = false,
        baseMoveCost = 1.0,
        diagonalCost = Math.SQRT2,
        climbCost = 0.5
    } = options;

    const startZ = start.k ?? grid.getTopZ(start.i, start.j);
    const targetZ = target.k ?? grid.getTopZ(target.i, target.j);

    const openHeap = new PriorityQueue();
    const openSetMap = new Map();
    const closedSet = new Set();

    const startNode = {
        i: start.i,
        j: start.j,
        k: startZ,
        g: 0,
        h: octileDistance(start, target),
        f: octileDistance(start, target),
        parent: null
    };

    const startKey = nodeKey(startNode.i, startNode.j, startNode.k);
    const targetKey = nodeKey(target.i, target.j, targetZ);

    openHeap.push(startNode);
    openSetMap.set(startKey, startNode);

    while (openHeap.size() > 0) {
        if (closedSet.size > maxSearch) {
            console.warn("A* Search aborted: Exceeded iteration limits.");
            return null;
        }

        const current = openHeap.pop();
        const currentKey = nodeKey(current.i, current.j, current.k);
        openSetMap.delete(currentKey);

        if (currentKey === targetKey) {
            const fullPath = reconstructPath(current);
            return returnNextStep ? (fullPath[1] || null) : fullPath;
        }

        closedSet.add(currentKey);

        for (const neighborCoord of getAdjacentCoordinates(current, allowDiagonal)) {
            const topZ = grid.getTopZ(neighborCoord.i, neighborCoord.j);
            
            // Unwalkable if no tiles exist below
            if (topZ === 0) continue; 

            // Elevation step threshold constraint (Max jump/climb height = 1)
            const dz = topZ - current.k;
            if (Math.abs(dz) > 1) continue;

            const nKey = nodeKey(neighborCoord.i, neighborCoord.j, topZ);
            if (closedSet.has(nKey)) continue;

            // Spatial obstruction check
            if (!grid.isTraversable(neighborCoord.i, neighborCoord.j, topZ)) continue;

            const isDiagonal = neighborCoord.i !== current.i && neighborCoord.j !== current.j;
            let stepCost = isDiagonal ? diagonalCost : baseMoveCost;

            // Elevation traversal weight
            if (dz > 0) stepCost += dz * climbCost;

            const gScore = current.g + stepCost;
            const existingNode = openSetMap.get(nKey);

            if (!existingNode || gScore < existingNode.g) {
                const neighborNode = {
                    i: neighborCoord.i,
                    j: neighborCoord.j,
                    k: topZ,
                    g: gScore,
                    h: octileDistance({ i: neighborCoord.i, j: neighborCoord.j }, target),
                    f: gScore + octileDistance({ i: neighborCoord.i, j: neighborCoord.j }, target),
                    parent: current
                };

                openSetMap.set(nKey, neighborNode);
                openHeap.push(neighborNode);
            }
        }
    }

    return null;
}