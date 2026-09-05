import { IsoMath } from "./iso-math.js";
import { SpatialGrid, TileEntity, ObstacleEntity } from "./spatial-grid.js";
import { find_path, find_both_paths } from "./pathfinding.js";


export const Engine = {
    /* Global Enginge Object that holds world settings, tilemaps, and import math logic from other files */

    iso: new IsoMath(32, 16, 320, 48),
    grid: new SpatialGrid(),
    
    // Grid settings
    area: 12,
    max_z: 3,
    scroll_speed: 2,

    // Runtime state tracking
    mouse: { i: 0, j: 0, k: 0, x: 0, y: 0 },
    tile_id: 1,             // determines tile to be placed (green --> red), switch with number keys
    tile_placement_k: 0,    // tracks which k-level tiles are being placed on
    pathfind_start: { i: 0, j: 0, k: 0 }, pathfind_target: { i: 0, j: 0, k: 0 },    //update with O & P keys to set path
    selector: null,
    
    // Renderable Instances of objects to pair alongside their map key
    tiles: [],          // Visual tile instances

    obstacles: [],      // Visual object instances

    water_tiles: [],     // Visual background water
    
    // Visual Depth Sorting Check
    // Prevents sprite sorting every frame/tick
    needs_depth_sort: false
};

runOnStartup(async (runtime) => {
    runtime.addEventListener("beforeprojectstart", () => onBeforeProjectStart(runtime));
    runtime.addEventListener("beforeanylayoutstart", () => intialize_map(runtime));
});

async function onBeforeProjectStart(runtime) {
    runtime.addEventListener("tick", () => tick(runtime));

    runtime.addEventListener("mousedown", (e) => {
        const { i, j } = Engine.mouse;
        const top_z = Engine.grid.get_top_z(i, j);

        
        if (e.button === 0) {
            // Left-click: Save Mouse K level for tile placement
            Engine.tile_placement_k = top_z;
        }

        if (e.button === 1) {
            
        }

        if (e.button === 2) {
            // Right-click: Delete

            if (Engine.grid.has_obstacle(i, j, top_z)) {
                Engine.grid.destroy_obstacle(i, j, top_z);
                Engine.obstacles = Engine.obstacles.filter(obs => Engine.grid.has_obstacle(obs.i, obs.j, obs.k));
                Engine.needs_depth_sort = true;
                return    // prevents deletion of tile underneath obstacle
            }

            if (top_z > 0) {
                Engine.grid.destroy_tile_stack(i, j, top_z - 1);
                Engine.tiles = Engine.tiles.filter(tile => Engine.grid.has_tile(tile.i, tile.j, tile.k));
                Engine.needs_depth_sort = true;
            }
        }
    });


    runtime.addEventListener("keydown", (e) => {
        const { i, j } = Engine.mouse;
        const top_z = Engine.grid.get_top_z(i, j);

        if (e.key === "Tab") {
            if (runtime.objects.TabMenuBackdrop.getFirstInstance().isVisible == true) {
                // Hide all instances
                runtime.objects.TabMenuText.instances().forEach(inst => inst.isVisible = false);
                runtime.objects.TabMenuBackdrop.getAllInstances().forEach(inst => inst.isVisible = false);
            }
            else {
                // Show all instances
                runtime.objects.TabMenuText.instances().forEach(inst => inst.isVisible = true);
                runtime.objects.TabMenuBackdrop.getAllInstances().forEach(inst => inst.isVisible = true);
            }
        }

        if(["1", "2", "3", "4"].includes(e.key)) {
            Engine.tile_id = Number(e.key);
            console.log("tile_id: " + e.key)
        }

        if(e.key === "q") {
            place_obstacle_at_mouse(runtime);
        }

        if (e.key === "o") {
            if (top_z == 0) return;

            Engine.pathfind_start = {i, j, top_z};
            if (!Engine.pathfind_start) return;

            runtime.objects.Text_pathStart.getFirstInstance().text = "PATH-START: " + String(i) + ", " + String(j) + ", " + String(top_z);
        }

        if (e.key === "p") {
            if (top_z == 0) return;
            
            Engine.pathfind_target = {i, j, top_z};
            if (!Engine.pathfind_target) return;

            runtime.objects.Text_pathEnd.getFirstInstance().text = "PATH-END: " + String(i) + ", " + String(j) + ", " + String(top_z);
        }

        if (e.key === "Enter") {
            const { shortest, least_costly } = find_both_paths(Engine.pathfind_start, Engine.pathfind_target, Engine.grid);


            //const path = find_path(Engine.pathfind_start, Engine.pathfind_target, Engine.grid);

            for (const inst of runtime.objects.PathMarkerLight.getAllInstances()) {inst.destroy();}
            for (const inst of runtime.objects.PathMarkerShort.getAllInstances()) {inst.destroy();}

            for (const tile of shortest.steps) {
                const {x, y} = Engine.iso.grid_to_screen(tile.i, tile.j, tile.k);
                runtime.objects.PathMarkerShort.createInstance(1, x, y);
            }

            for (const tile of least_costly.steps) {
                const {x, y} = Engine.iso.grid_to_screen(tile.i, tile.j, tile.k);
                runtime.objects.PathMarkerLight.createInstance(1, x, y);
            }

            runtime.objects.Text_pathLength.getFirstInstance().text = "PATH-LENGTH: " + String(least_costly.steps.length);
            runtime.objects.Text_pathCost.getFirstInstance().text = "PATH-COST: " + String(least_costly.total_cost);

        }
    });
}

function intialize_map(runtime) {
    /* Generates the water tiles to be used as a base and representation of area limits */
    for (let i = 0; i <= Engine.area; i++) {
        for (let j = 0; j <= Engine.area; j++) {

            const { x: screen_x, y: screen_y } = Engine.iso.grid_to_screen(i, j, 0);  
            const water_tile = runtime.objects.WaterTile.createInstance(0, screen_x, screen_y);
            
            Engine.water_tiles.push({ i, j, k: -1, instance: water_tile });
        }
    }
    Engine.needs_depth_sort = true;
}

function tick(runtime) {
    /* Runs every tick, handles most continuous/real time logic */

    //  handle_camera_scroll(runtime);     // currently removed to improve performance

    // Update Mouse and Grid Position
    Engine.mouse.x = runtime.mouse.getMouseX();
    Engine.mouse.y = runtime.mouse.getMouseY();

    const { i, j } = Engine.iso.screen_to_grid(Engine.mouse.x, Engine.mouse.y);
    // If mouse moves beyond a tile, selector instance needs to be re-sorted to appear on top
    if (Engine.mouse.i !== i || Engine.mouse.j !== j) {
        Engine.needs_depth_sort = true;
    }

    Engine.mouse.i = i;
    Engine.mouse.j = j;

    const top_z = Engine.grid.get_top_z(i, j);
    Engine.mouse.k = top_z;

    // Update Selector's Graphic Position
    Engine.selector = runtime.objects.Selector.getFirstInstance();
    if (Engine.selector) {
        const { x, y } = Engine.iso.grid_to_screen(i, j, top_z);
        Engine.selector.x = x;
        Engine.selector.y = y;
    }

    // Tile placement when mouse is held down
    if (runtime.mouse.isMouseButtonDown(0)) {
        place_tile_at_mouse(runtime);
    } 

    // Run depth sorting function
    if (Engine.needs_depth_sort) {
        sort_isometric_depth();
        Engine.needs_depth_sort = false;
    }

    // Update tabMenu text
    runtime.objects.Text_fps.getFirstInstance().text = "FPS: " + String(runtime.fps);
    runtime.objects.Text_tileCount.getFirstInstance().text = "TILE-COUNT: " + String(Engine.tiles.length);
    runtime.objects.Text_mouseCoords.getFirstInstance().text = "COORDS (i, j, k): " + String(i) + ", " + String(j) + ", " + String(top_z);
    
}

function place_tile_at_mouse(runtime) {
    const { i, j, k } = Engine.mouse;

    if (i < 0 || i > Engine.area || j < 0 || j > Engine.area) return; // Out of bounds
    if (k > Engine.max_z) return;                                     // Max height limit
    if (k > 0 && !Engine.grid.has_tile(i, j, k - 1)) return;         // Cannot place in mid-air
    if (Engine.grid.has_tile(i, j, k)) return;                       // Occupied
    if (Engine.grid.has_obstacle(i, j, k)) return;                    // Occupied by obstacle
    if (k != Engine.tile_placement_k) return;                       // Different height level than initial placement

    const { x: screen_x, y: screenY } = Engine.iso.grid_to_screen(i, j, k);
    const new_tile_instance = runtime.objects.LandTile.createInstance(0, screen_x, screenY);

    const new_tile = new TileEntity(i, j, k, Engine.tile_id, new_tile_instance);
    Engine.grid.add_tile(new_tile);
    Engine.tiles.push(new_tile);
    
    Engine.needs_depth_sort = true;
}

function place_obstacle_at_mouse(runtime) {
    const { i, j, k } = Engine.mouse;

    if (i < 0 || i > Engine.area || j < 0 || j > Engine.area) return; // Out of bounds
    if (!Engine.grid.has_tile(i, j, k - 1)) return;         // Cannot place in mid-air
    if (Engine.grid.has_obstacle(i, j, k)) return;                       // Occupied by seperate obstacle
    
    const { x: screen_x, y: screenY } = Engine.iso.grid_to_screen(i, j, k);
    const new_obstacle_instance = runtime.objects.Obstacle.createInstance(0, screen_x, screenY);

    const new_obstacle = new ObstacleEntity(i, j, k, new_obstacle_instance);
    Engine.grid.add_obstacle(new_obstacle);
    Engine.obstacles.push(new_obstacle);

    Engine.needs_depth_sort = true;
}

function sort_isometric_depth() {
    /*
        Sorts visual instances selector, each tile and each object by their i,j,k coords 
        all instances are stored in sortables list
        Uses compare_iso_depth function found in IsoMath script
    */
    const selector_obj = Engine.selector 
        ? [{ i: Engine.mouse.i, j: Engine.mouse.j, k: Engine.mouse.k, instance: Engine.selector }] 
        : [];

    const sortables = [
        ...Engine.tiles,
        ...Engine.obstacles,
        ...Engine.water_tiles,
        ...selector_obj,
    ];

    
    sortables.sort(IsoMath.compare_iso_depth);

    for (let index = 0; index < sortables.length; index++) {
        sortables[index].instance.moveToTop();
    }
}

function handle_camera_scroll(runtime) {
    /* Placeholder function to scroll camera, needs to be updated to fix waiting when camera obj is stuck in corner */
    const camera = runtime.objects.Camera.getFirstInstance();
    if (!camera) return;

    if (runtime.keyboard.isKeyDown("KeyW")) camera.y -= Engine.scroll_speed;
    if (runtime.keyboard.isKeyDown("KeyS")) camera.y += Engine.scroll_speed;
    if (runtime.keyboard.isKeyDown("KeyA")) camera.x -= Engine.scroll_speed;
    if (runtime.keyboard.isKeyDown("KeyD")) camera.x += Engine.scroll_speed;
}