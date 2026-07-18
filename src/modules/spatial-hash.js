// ============================================
// SpatialHash — O(n) neighbor lookup for particles
// ============================================
// Why spatial hashing instead of brute-force O(n²):
// At 80 particles with CONNECT_DIST=150, brute force does ~3,160 distance
// checks per frame. Spatial hash reduces this to only nearby-cell checks,
// typically under 300. Same pattern used in broad-phase collision detection
// in game engines (UE5 uses octree/grid for similar purposes).

/**
 * Grid-based spatial hash for fast neighbor queries.
 * Each cell stores indices of particles within that grid cell.
 */
export class SpatialHash {
    /**
     * @param {number} cellSize - Grid cell size (should match or exceed connection distance)
     */
    constructor(cellSize) {
        this.cellSize = cellSize;
        /** @type {Map<string, number[]>} */
        this.cells = new Map();
    }

    /** Clear all cells for a new frame */
    clear() {
        this.cells.clear();
    }

    /**
     * Hash a world position to a cell key.
     * @param {number} x
     * @param {number} y
     * @returns {string} Cell key
     */
    _key(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }

    /**
     * Insert a particle index at a given position.
     * @param {number} index - Particle array index
     * @param {number} x
     * @param {number} y
     */
    insert(index, x, y) {
        const key = this._key(x, y);
        const cell = this.cells.get(key);
        if (cell) {
            cell.push(index);
        } else {
            this.cells.set(key, [index]);
        }
    }

    /**
     * Query all particle indices within range of a position.
     * Checks the 3x3 neighborhood of cells around the target.
     * @param {number} x
     * @param {number} y
     * @returns {number[]} Array of nearby particle indices
     */
    queryNear(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        const result = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const cell = this.cells.get(`${cx + dx},${cy + dy}`);
                if (cell) {
                    for (let k = 0; k < cell.length; k++) {
                        result.push(cell[k]);
                    }
                }
            }
        }
        return result;
    }
}
