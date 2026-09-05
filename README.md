### Discrete Spatial Modelling Engine
A personal game-dev project that was discarded and later turned into an isometric grid-based modelling engine.
This project has been heavily refactored into a modular architecture to demonstrate efficient algorithmic design,
clean state management, and strict separation of math logic from the visual rendering runtime.

This project can prove useful to those building their own isometric, grid-based games. Feel free to look at, study, and even copy any code you see. While built in the Construct 3 web engine, The underlying logic behind the grid systems is modular and should apply to any programming language with appropriate tweaks.

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

*Controls*
* RMB: Place tiles
* LMB: Delete tiles
* Q: Place Obstacle (makes tile untraversable)
* [1-4]: select tile id (goes green -> red, represents travel cost across type of tile)
* O: Set Path Start Tile
* P: Set Path End Tile
* ENTER: Run Pathfinding algorithm


### Future Work
- Alternative paths are now shown (shortest path vs least costly path), but wish to make visibility configurable
- Make world settings configurable in real time, i.e. Map Area, Terrain Height Max, Pathfinding settings
- Ability to copy/save a terrain map as a discrete HashMap, then be able to paste it into the program and load the same map
- I may eventually add procedural generation with configurable settings, along with generation seeds
