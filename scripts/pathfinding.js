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

function octile_distance(a, b) {
    const dx = Math.abs(a.i - b.i);
    const dy = Math.abs(a.j - b.j);
    const D = 1;
    const D2 = Math.SQRT2;
    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
}

function node_key(i, j, k) {
    return `${i},${j},${k}`;
}

function reconstruct_path(node) {
    const path = [];
    let current = node;
    while (current) {
        path.push({ i: current.i, j: current.j, k: current.k });
        current = current.parent;
    }
    return path.reverse();
}

function get_adjacent_coordinates(node, allow_diagonal) {
    const directions = allow_diagonal
        ? [
            { i: 1, j: 0 }, { i: -1, j: 0 }, { i: 0, j: 1 }, { i: 0, j: -1 },
            { i: 1, j: 1 }, { i: 1, j: -1 }, { i: -1, j: 1 }, { i: -1, j: -1 }
        ]
        : [
            { i: 1, j: 0 }, { i: -1, j: 0 }, { i: 0, j: 1 }, { i: 0, j: -1 }
        ];

    return directions.map(d => ({ i: node.i + d.i, j: node.j + d.j }));
}


export function find_path(start, target, grid, options = {}) {
    /*
        Modern A* Spatial Pathfinding Solver
        - param {Object} start - {i, j, k}
        - @param {Object} target - {i, j, k}
        - @param {Object} grid - Abstraction layer exposing get_top_z(i,j) and is_traversable(i,j,k)
        - @param {Object} options - Pathfinding settings
        Returns null if no path is found
        Returns null if # of searched tiles exceeds max_search size
        Returns {steps, cost}, array of step coordinates and the total travel cost of the path
    */
    const {
        allow_diagonal = true,
        max_search = 2000,
        return_only_next_step = false,
        base_move_cost = 1.0,
        diagonal_cost = 1.0,
        climb_cost = 0.5
    } = options;

    const start_z = start.k ?? grid.get_top_z(start.i, start.j);
    const target_z = target.k ?? grid.get_top_z(target.i, target.j);

    const open_heap = new PriorityQueue();
    const open_set_map = new Map();
    const closed_set = new Set();

    const start_node = {
        i: start.i,
        j: start.j,
        k: start_z,
        g: 0,
        h: octile_distance(start, target),
        f: octile_distance(start, target),
        parent: null
    };

    const start_key = node_key(start_node.i, start_node.j, start_node.k);
    const target_key = node_key(target.i, target.j, target_z);

    open_heap.push(start_node);
    open_set_map.set(start_key, start_node);


    while (open_heap.size() > 0) {

        if (closed_set.size > max_search) {
            console.warn("A* Search aborted: Exceeded iteration limits.");
            return null;
        }

        const current = open_heap.pop();
        const current_key = node_key(current.i, current.j, current.k);
        open_set_map.delete(current_key);

        if (current_key === target_key) {
            const fullPath = reconstruct_path(current);
            return {
                steps: fullPath,
                total_cost: current.g,
            }
        }

        closed_set.add(current_key);

        for (const neighbor_coord of get_adjacent_coordinates(current, allow_diagonal)) {
            const top_z = grid.get_top_z(neighbor_coord.i, neighbor_coord.j);
            
            // Unwalkable if no tiles exist below
            if (top_z === 0) continue; 

            // Elevation step constraint (Max jump/climb height = 1)
            const dz = top_z - current.k;
            if (Math.abs(dz) > 1) continue;

            // Ignore keys already traversed
            const n_key = node_key(neighbor_coord.i, neighbor_coord.j, top_z);
            if (closed_set.has(n_key)) continue;

            // Spatial obstruction check
            if (!grid.is_traversable(neighbor_coord.i, neighbor_coord.j, top_z)) continue;

            // Add additonal "diagonal cost" (can be zero) if next tile is a diagonal
            const is_diagonal = neighbor_coord.i !== current.i && neighbor_coord.j !== current.j;
            let step_cost = is_diagonal ? diagonal_cost : base_move_cost;

            // Retrieve the ground tile underneath the step target
            const groundTile = grid.get_tile(neighbor_coord.i, neighbor_coord.j, top_z - 1);

            // Add custom move cost based on tile_id in TileEntity class
            step_cost += groundTile?.cost ?? 0;

            // Elevation traversal cost, adds "climb_cost" to base travel cost according to flights climbed during step
            if (dz > 0) step_cost += dz * climb_cost;

            const g_score = current.g + step_cost;
            const existing_node = open_set_map.get(n_key);

            if (!existing_node || g_score < existing_node.g) {
                const neighbor_node = {
                    i: neighbor_coord.i,
                    j: neighbor_coord.j,
                    k: top_z,
                    g: g_score,
                    h: octile_distance({ i: neighbor_coord.i, j: neighbor_coord.j }, target),
                    f: g_score + octile_distance({ i: neighbor_coord.i, j: neighbor_coord.j }, target),
                    parent: current
                };

                open_set_map.set(n_key, neighbor_node);
                open_heap.push(neighbor_node);
            }
        }
    }

    return null;
}