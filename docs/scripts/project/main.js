import { IsoMath } from "./iso-math.js";
import { SpatialGrid, TileEntity, ObjectInstance } from "./spatial-grid.js";
import { find_path } from "./pathfinding.js";


export const Engine = {
    /* Global Enginge Object that holds world settings, tilemaps, and import math logic from other files */

    iso: new IsoMath(32, 16, 320, 48),
    grid: new SpatialGrid(),
    
    // Grid settings
    area: 16,
    max_z: 2,
    scroll_speed: 2,

    // Runtime state tracking
    mouse: { i: 0, j: 0, k: 0, x: 0, y: 0 },
    selector: null,
    
    // Renderable Instances of objects to pair alongside their map key
    tiles: [],          // Visual tile instances

    obj_instances: [],      // Visual object instances
    // Currently no 'objects' implemented

    water_tiles: [],     // Visual background water obj_instances
    
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

        // Right-click: Delete top tile in the stack
        if (e.button === 2) {
            if (top_z > 0) {
                Engine.grid.destroy_tile_stack(i, j, top_z - 1);
                Engine.tiles = Engine.tiles.filter(tile => Engine.grid.has_tile(tile.i, tile.j, tile.k));
                Engine.needs_depth_sort = true;
            }
        }
    });

    runtime.addEventListener("keydown", (e) => {
        if (e.key === "q") {
            console.log("Mouse Grid Position:", Engine.mouse.i, Engine.mouse.j, "Top Z:", Engine.grid.get_top_z(Engine.mouse.i, Engine.mouse.j));
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

    handle_camera_scroll(runtime);

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
    // need to add restraints on k/z-level to prevent tiles instantly stacking when holding mouse button
    if (runtime.mouse.isMouseButtonDown(0)) {
        place_tile_at_mouse(runtime);
    } 

    // Run depth sorting function
    if (Engine.needs_depth_sort) {
        sort_isometric_depth();
        Engine.needs_depth_sort = false;
    }
}

function place_tile_at_mouse(runtime) {
    const { i, j, k } = Engine.mouse;

    if (i < 0 || i > Engine.area || j < 0 || j > Engine.area) return; // Out of bounds
    if (k > Engine.max_z) return;                                     // Max height limit
    if (k > 0 && !Engine.grid.has_tile(i, j, k - 1)) return;         // Cannot place in mid-air
    if (Engine.grid.has_tile(i, j, k)) return;                       // Occupied

    const { x: screen_x, y: screenY } = Engine.iso.grid_to_screen(i, j, k);
    const new_tile_instance = runtime.objects.GrassTile.createInstance(0, screen_x, screenY);

    const new_tile = new TileEntity(i, j, k, new_tile_instance);
    Engine.grid.add_tile(new_tile);
    Engine.tiles.push(new_tile);
    
    // Prevent continuous multi-layer stacking without mouse re-press
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
        ...Engine.obj_instances,
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