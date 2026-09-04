export class IsoMath {
    /*
        Blueprint for several math functions related to an isometric grid
        Can be used in just about any grid-based isometric engine/game project
    */
    constructor(tile_width = 32, tile_height = 16, offset_x = 320, offset_y = 48) {
        this.tile_width = tile_width;
        this.tile_height = tile_height;
        this.offset_x = offset_x;
        this.offset_y = offset_y;
    }

    grid_to_screen(i, j, k = 0) {
        /* Converts grid coordinates (i,j,k) to on screen (x, y) coordinates */

        const x = (i - j) * (this.tile_width / 2) + this.offset_x;
        const y = (i + j) * (this.tile_height / 2) + this.offset_y;
    
        // Subtract vertical elevation from the calculated ground screen point to show tile stacking
        return { 
            x, 
            y: y - (k * (this.tile_height / 2)) 
        };
    }

    screen_to_grid(x, y) {
        /*
            Converts screen coordinates (x, y) to isometric coordinates (i, j)
            k is normally calculated seperatley by the global SpatialGrid object using an (i, j) coordinate
        */

        const relative_x = x - this.offset_x;
        const relative_y = y - this.offset_y;
        
        const i = (relative_y / (this.tile_height / 2) + relative_x / (this.tile_width / 2)) / 2;
        const j = (relative_y / (this.tile_height / 2) - relative_x / (this.tile_width / 2)) / 2;
        
        return { i: Math.round(i), j: Math.round(j) };
    }

   
    static compare_iso_depth(a, b) {
        /*
            Depth Sorting Comparison Function for Isometric Rendering
            Sorts items relative to spatial depth (i + j, then k)    
        */
        const order_a = a.i + a.j;
        const order_b = b.i + b.j;
        return order_a === order_b ? a.k - b.k : order_a - order_b;
    }
}