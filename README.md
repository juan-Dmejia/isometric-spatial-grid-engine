### Discrete Spatial Modelling Engine
A personal game-dev project that was discarded and later turned into an isometric grid-based modelling engine.
This project has been heavily refactored into a modular architecture to demonstrate efficient algorithmic design,
clean state management, and strict separation of math logic from the visual rendering runtime.

### Core Architecture & Features
* **Isometric Projections (`IsoMath.js`):** Handles screen-to-grid coordinate mapping utilizing a fixed baseline for ground tiles, calculating vertical $k$-level offsets via precise $Y$-coordinate subtraction.
* **Spatial State Management (`SpatialGrid.js`):** Implements an $O(1)$ spatial lookup grid for rapid state querying, collision detection, and terrain elevation locking during click-and-drag events.
* **A* Pathfinding (`Pathfinding.js`):** Algorithmic traversal optimized with a binary heap priority queue, allowing for highly efficient point-to-point graph solving across complex 3D grid spaces. Currently unused but will become an integral part of the projects purpose for path cost simulations
* **Dynamic Depth Sorting:** Maintains visual integrity through an array-based $Z$-order sorting algorithm utilizing $i + j$ depth calculations, dynamically triggering upon mouse grid changes to prevent selector overlap.

### Project Structure

* `Discrete Spatial Modelling Engine`: The core logical framework file driving the spatial engine.
* `/docs`: Contains the HTML5 web export, automatically deployed and playable directly in the browser via GitHub Pages.
* `/scripts`: Houses the decoupled, engine-agnostic ES6 JavaScript classes.

### Live Demo

The engine is actively hosted via GitHub Pages. Click the link in the repository's "About" section to test the live interactive web build!
The controls are WASD to move the camera, right click to place tiles, and left click to delete tiles. There is a small glitch currently that only allows placing max stack tiles but that will be fixed in coming updates.

### Future Work
The project is still a work in progress. A pathfinding algorithm was implemented back when the project was intended as a video game.
Now the algorithm remains unused, but my current plan is to create a path-cost simulation tool with configurable obstacles, terrain costs, etc.
In the future I may add procedural generation with configurable settings, along with generation seeds and even map presets to load in maps base on discrete keys.
