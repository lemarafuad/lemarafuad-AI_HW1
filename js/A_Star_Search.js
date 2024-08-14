// A_Star_Search.js

import { PriorityQueue } from './priority_queue.js';
function getNeighbors(node, grid) {
    const neighbors = [];
    const directions = [
        { x: -1, y: 0 }, // left
        { x: 0, y: -1 }, // up
        { x: 1, y: 0 },  // right
        { x: 0, y: 1 }   // down
    ];

    for (const dir of directions) {
        const newX = node.x + dir.x;
        const newY = node.y + dir.y;

        if (newX >= 0 && newY >= 0 && newX < grid.length && newY < grid[0].length) {
            if (grid[newX][newY] !== 1) { // Not a wall
                neighbors.push({ x: newX, y: newY });
            }
        }
    }

    return neighbors;
}

export function aStarSearch(grid, start, goal, heuristicType) {
    const openSet = new PriorityQueue();
    const openSetItems = new Set(); // Ensure openSetItems is defined
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    let testedNodes = 0;
    let testedNodesList = []; // Array to keep track of tested nodes

    openSet.enqueue(start, 0); // Start by enqueuing the start node with priority 0
    openSetItems.add(JSON.stringify(start));
    gScore.set(start, 0);
    fScore.set(start, heuristic(start, goal));

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        openSetItems.delete(JSON.stringify(current));

        if (current.x === goal.x && current.y === goal.y) {
            return {
                path: reconstructPath(cameFrom, current),
                testedNodes: testedNodes,
                testedNodesList: testedNodesList // Include tested nodes list in result
            };
        }

        for (const neighbor of getNeighbors(current, grid)) {
            const arrive_cost = gScore.get(current) + 1;

            if (!gScore.has(neighbor) || arrive_cost < gScore.get(neighbor)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, arrive_cost);
                fScore.set(neighbor, gScore.get(neighbor) + heuristic(neighbor, goal));

                if (!openSetItems.has(JSON.stringify(neighbor))) {
                    openSet.enqueue(neighbor, fScore.get(neighbor));
                    openSetItems.add(JSON.stringify(neighbor));
                }
            }
        }

        testedNodes++;
        testedNodesList.push(current); // Add current node to tested nodes list
    }

    // If no path is found, return empty path
    return {
        path: [],
        testedNodes,
        testedNodesList
    };


    

    function heuristic(a, b) {
        if (heuristicType === 'manhattan') {
            return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        } else {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        }
    }

    function reconstructPath(cameFrom, current) {
        const path = [current];
        while (cameFrom.has(current)) {
            current = cameFrom.get(current);
            path.push(current);
        }
        return path.reverse();
    }
}   