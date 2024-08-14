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

export function bestFirstSearch(grid, start, goal, heuristicType) {
    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map(); // To store the cost from the start to each node
    let testedNodes = 0;
    let testedNodesList = []; // Array to keep track of tested nodes

    // Convert nodes to strings for consistent Map/Set handling
    const startKey = JSON.stringify(start);
    const goalKey = JSON.stringify(goal);

    openSet.enqueue(start, heuristic(start, goal));
    const openSetItems = new Set();
    openSetItems.add(startKey);
    gScore.set(startKey, 0); // Starting point has a cost of 0

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        const currentKey = JSON.stringify(current);
        openSetItems.delete(currentKey);

        if (currentKey === goalKey) {
            return {
                path: reconstructPath(cameFrom, current),
                testedNodes: testedNodes,
                testedNodesList: testedNodesList // Include tested nodes list in result
            };
        }

        for (const neighbor of getNeighbors(current, grid)) {
            const neighborKey = JSON.stringify(neighbor);
            const arrive_cost = (gScore.get(currentKey) || 0) + 1; // Assume each step has a cost of 1

            if (arrive_cost < (gScore.get(neighborKey) || Infinity)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighborKey, arrive_cost);

                if (!openSetItems.has(neighborKey)) {
                    const priority = heuristic(neighbor, goal);
                    openSet.enqueue(neighbor, priority);
                    openSetItems.add(neighborKey);
                }
            }
        }

        testedNodes++;
        testedNodesList.push(current); // Add current node to tested nodes list
    }

    console.log('No path found');
    return { path: [], testedNodes: testedNodes, testedNodesList: testedNodesList };

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
