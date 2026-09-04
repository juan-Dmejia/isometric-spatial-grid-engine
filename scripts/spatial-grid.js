export class TileEntity {
    /* Constructor class used by all land & water tiles */

    constructor(i, j, k, instance = null) {
        this.i = i;
        this.j = j;
        this.k = k;
        this.instance = instance;
    }

    is_edge_tile(grid) {
    /* Checks itself to see if its a tile adjacent to water, currently unused*/
        if (this.k > 0) return false;

        const neighbors = [
            { di: 1, dj: 0 },
            { di: -1, dj: 0 },
            { di: 0, dj: 1 },
            { di: 0, dj: -1 }
        ];

        return neighbors.some(({ di, dj }) => !grid.has_tile(this.i + di, this.j + dj, this.k));
    }
}

export class ObjectInstance {
    /* Constructor class used by all object instances, currently unused */
    constructor(i, j, k, id, instance = null) {
        this.i = i;
        this.j = j;
        this.k = k;
        this.id = id;
        this.instance = instance;
    }

    destroy() {
        if (this.instance?.destroy) this.instance.destroy();
    }
}

export class SpatialGrid {
    /* Constructor class for the world grid, used as a global object to handle tile positions discretley */
    constructor() {
        // Hash maps using "i,j,k" keys for low-power state checks
        this.tile_map = new Map();
        this.instance_map = new Map();
    }

    get_key(i, j, k) {
        /*  Helper to generate consistent hash key coordinates */
        return `${i},${j},${k}`;
    }

    // Tile management functions

    add_tile(tileEntity) {
        const key = this.get_key(tileEntity.i, tileEntity.j, tileEntity.k);
        this.tile_map.set(key, tileEntity);
    }

    get_tile(i, j, k) {
        return this.tile_map.get(this.get_key(i, j, k));
    }

    has_tile(i, j, k) {
        return this.tile_map.has(this.get_key(i, j, k));
    }

    // object instance functions

    add_instance(object_instance) {
        const key = this.get_key(object_instance.i, object_instance.j, object_instance.k);
        this.instance_map.set(key, object_instance);
    }

    get_instance(i, j, k) {
        return this.instance_map.get(this.get_key(i, j, k));
    }

    has_instance(i, j, k) {
        return this.instance_map.has(this.get_key(i, j, k));
    }

    // Spatial Queries used by Pathfinding & Main Engine

    get_top_z(i, j) {
        /* Returns the highest elevation level above ground (k) */
        let z = 0;
        while (this.has_tile(i, j, z)) {
            z++;
        }
        return z;
    }

    is_traversable(i, j, k) {
        /* Interface method required by Pathfinding.js, Currently unused */

        // Unwalkable if blocked by an instance/building at elevation k
        if (this.has_instance(i, j, k)) return false;
        
        // Walkable if a ground tile exists below the current step level
        return this.has_tile(i, j, k - 1);
    }

    // Destruction Logic
    
    destroy_tile_stack(i, j, k) {
        /* Stack destruction for multi-layer tile structures */
        const key = this.get_key(i, j, k);
        const tile = this.tile_map.get(key);

        if (!tile) return;

        // Destroy any tile directly above first
        this.destroy_tile_stack(i, j, k + 1);

        // Remove from spatial state tracking
        this.tile_map.delete(key);

        // Destroy runtime graphics object if bound
        if (tile.instance?.destroy) {
            tile.instance.destroy();
        }
    }

    destroy_instance(i, j, k) {
        const key = this.get_key(i, j, k);
        const object_instance = this.instance_map.get(key);

        if (object_instance) {
            object_instance.destroy();
            this.instance_map.delete(key);
        }
    }
}