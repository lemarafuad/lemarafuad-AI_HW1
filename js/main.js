// Import necessary functions if using modules
import { aStarSearch } from './A_Star_Search.js';
import { uniformCostSearch } from './Uniform_Cost_Search.js';
import { bestFirstSearch } from './Best_First_Search.js';

let characterPosition = null;
let goalPosition = null;
let mazeGrid = null; // To store the generated maze grid
let colorSelect = null; // To store the selected color
let characterImagePath = null; // To store the selected character image path
let isRandomMode = false; // Toggle for manual maze creation
let isfinished=false;
let isstartpos=false;
let isgoalpos=false;
const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');

function generateMap(sizeMap, skipChance) {
    const grid = Array.from({ length: sizeMap.x }, () => Array(sizeMap.y).fill(0));

    // Set the walls
    for (let x = 0; x < sizeMap.x; x++) {
        grid[x][0] = 1;
        grid[x][sizeMap.y - 1] = 1;
    }

    for (let y = 0; y < sizeMap.y; y++) {
        grid[0][y] = 1;
        grid[sizeMap.x - 1][y] = 1;
    }

    // Create rng
    const rng = () => Math.random();

    // Set the anchor points
    const anchorPoints = [];
    for (let x = 1; x < sizeMap.x - 1; x++) {
        for (let y = 1; y < sizeMap.y - 1; y++) {
            if (x % 2 === 0 && y % 2 === 0) {
                if (rng() > skipChance) {
                    grid[x][y] = 1;
                    anchorPoints.push({ x, y });
                }
            }
        }
    }

    // Randomize anchor points order
    anchorPoints.sort(() => Math.random() - 0.5);

    // Directions array
    const directions = [
        { x: -1, y: 0 }, // left
        { x: 0, y: -1 }, // up
        { x: 1, y: 0 },  // right
        { x: 0, y: 1 }   // down
    ];

    // Process anchor points
    for (const point of anchorPoints) {
        const currDirection = directions[Math.floor(Math.random() * 4)];
        let currPosition = { ...point };

        while (true) {
            const newPos = {
                x: currPosition.x + currDirection.x,
                y: currPosition.y + currDirection.y
            };

            if (grid[newPos.x] && grid[newPos.x][newPos.y] === 1) {
                break;
            } else {
                if (grid[newPos.x]) grid[newPos.x][newPos.y] = 1;
                currPosition = newPos;
            }
        }
    }

    return grid;
}

function drawMap(grid, cellSize, charPos, goalPos, backgroundColor, testedNodesList) {
    const canvas = document.getElementById('maze');
    const ctx = canvas.getContext('2d');
    canvas.width = grid.length * cellSize;
    canvas.height = grid[0].length * cellSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[0].length; y++) {
            ctx.fillStyle = grid[x][y] === 1 ? 'white' : backgroundColor;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

            if (isRandomMode || (!isRandomMode && isfinished)) {
                if (charPos && x === charPos.x && y === charPos.y && isstartpos) {
                    if (characterImagePath) {
                        const img = new Image();
                        img.src = characterImagePath;
                        img.onload = () => {
                            ctx.drawImage(img, x * cellSize, y * cellSize, cellSize, cellSize);
                            const startButton = document.getElementById('start');
                            if (startButton) {
                                startButton.disabled = true;
                            }
                        };
                    } else {
                        console.log("Character image path not set.");
                    }
                }

                if (goalPos && x === goalPos.x && y === goalPos.y && isgoalpos) {
                    const img = new Image();
                    img.src = "/image/icons8-home-100.png";
                    img.onload = () => {
                        ctx.drawImage(img, x * cellSize, y * cellSize, cellSize, cellSize);
                        const endButton = document.getElementById('goal');
                            if (endButton) {
                                endButton.disabled = true;
                            }
                    };
                }
            }
        }
    }

    // Draw the tested nodes
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red
    if (Array.isArray(testedNodesList)) {
        for (const node of testedNodesList) {
            console.log('Tested Node:',node);
            ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
        }
    }
}



function enableAlgorithmAndHeuristic() {
    const algorithmSelect = document.getElementById('algorithm-select');
    const heuristicSelect = document.getElementById('heuristic-select');
    const solveButton = document.getElementById('solve-button');
    
    if (characterPosition && goalPosition) {
        algorithmSelect.disabled = false;
        heuristicSelect.disabled = false;
        solveButton.disabled=false;
    }
}

function displayResults(result) {
    const testedNodesContainer = document.getElementById('tested-nodes-container');
    const pathContainer = document.getElementById('path-container');

    // Clear previous results
    testedNodesContainer.innerHTML = '';
    pathContainer.innerHTML = '';

    // Add tested nodes information
    const testedNodesElement = document.createElement('p');
    testedNodesElement.textContent = `Tested Nodes: ${result.testedNodes}`;
    testedNodesContainer.appendChild(testedNodesElement);

    // Optionally display the path information
    if (result.path.length > 0) {
        const pathElement = document.createElement('p');
        pathElement.textContent = `Path length: ${result.path.length}`;
        pathContainer.appendChild(pathElement);
    }
}

function drawPath(path, cellSize) {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;

    ctx.beginPath();
    if (path.length > 0) {
        ctx.moveTo(path[0].x * cellSize + cellSize / 2, path[0].y * cellSize + cellSize / 2);
        for (const point of path) {
            console.log('Path:', path);
            ctx.lineTo(point.x * cellSize + cellSize / 2, point.y * cellSize + cellSize / 2);
        }
        ctx.stroke();
    }
}

function generateGrid(sizeMap) {
    const grid =Array.from({ length: sizeMap.x }, () => Array(sizeMap.y).fill(0));

    for (let x = 0; x < sizeMap.x; x++) {
        grid[x][0] = 1;
        grid[x][sizeMap.y - 1] = 1;
    }
    for (let y = 0; y < sizeMap.y; y++) {
        grid[0][y] = 1;
        grid[sizeMap.x - 1][y] = 1;
    }
    console.log('Generated grid:', grid);
    return grid;
}


function getCanvasPosition1(event, cellSize) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    return { cellX, cellY };
}
function getCanvasPosition(event, cellSize) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((event.clientX - rect.left) / cellSize),
        y: Math.floor((event.clientY - rect.top) / cellSize)
    };
}


document.addEventListener('DOMContentLoaded', () => {
    const randomButton = document.getElementById('1');
    const userButton1 = document.getElementById('2');
    const userButton2 = document.getElementById('3');
    const startpos=document.getElementById('start');
    const endpos=document.getElementById('goal');
    const solveButton = document.getElementById('solve-button');
    const algorithmSelect = document.getElementById('algorithm-select');
    const heuristicSelect = document.getElementById('heuristic-select');
    const canvas = document.getElementById('maze');


    randomButton.addEventListener('click', (event) => {
        event.preventDefault();
        isRandomMode = true;
        isfinished=false;
    
        const level = document.getElementById('levelselect').value;
        colorSelect = document.getElementById('colorselect').value;
        characterImagePath = document.getElementById('characterselect').value;
    
        const cellSize = parseInt(level, 10);
        const sizeMap = { x: Math.floor(650 / cellSize), y: Math.floor(650 / cellSize) };
    
        mazeGrid = generateMap(sizeMap, 0.3);
    
        characterPosition = null;
        goalPosition = null;
    
        drawMap(mazeGrid, cellSize, characterPosition, goalPosition, colorSelect);
    
        // Store cell size in canvas dataset
        canvas.dataset.cellSize = cellSize;
    
        // Keep dropdowns disabled initially
        algorithmSelect.disabled = true;
        heuristicSelect.disabled = true;
        
    });
    
    userButton1.addEventListener('click', (event) => {
        event.preventDefault();
        isRandomMode = false;
        isfinished=false;

        const level = document.getElementById('levelselect').value;
        colorSelect = document.getElementById('colorselect').value;
        characterImagePath = document.getElementById('characterselect').value;
    
        const cellSize = parseInt(level, 10);
        const sizeMap = { x: Math.floor(650 / cellSize), y: Math.floor(650 / cellSize) };
    
        mazeGrid = generateGrid(sizeMap);

        characterPosition = null;
        goalPosition = null;
    
        // drawGrid(mazeGrid, cellSize, colorSelect);
        drawMap(mazeGrid, cellSize, characterPosition, goalPosition, colorSelect);

        canvas.dataset.cellSize = cellSize;

    });

    canvas.addEventListener('click', (event) => {
        if (!mazeGrid) return;
    
        const cellSize = parseInt(canvas.dataset.cellSize, 10);
        if (isNaN(cellSize) || cellSize <= 0) {
            console.error('Cell size not defined or invalid.');
            return;
        }
    
        if (!isRandomMode&&!isfinished) {
            console.log("manual");
            const cellSize = parseInt(canvas.dataset.cellSize, 10);
            const pos = getCanvasPosition1(event, cellSize);
            mazeGrid[pos.cellX][pos.cellY] = mazeGrid[pos.cellX][pos.cellY] === 1 ? 0 : 1; // Toggle cell state
            drawMap(mazeGrid, cellSize, characterPosition, goalPosition, colorSelect);
        } 
        else if (!isRandomMode&&isfinished&&isstartpos||!isRandomMode&&isfinished&&isgoalpos||isRandomMode&&isfinished&&isstartpos||isRandomMode&&isfinished&&isgoalpos) {
            const pos1 = getCanvasPosition1(event, cellSize);
            const pos2 = getCanvasPosition(event, cellSize);
            if(mazeGrid[pos1.cellX][pos1.cellY]==1){
                alert("Cannot place start or goal position on a wall.");
            }
            else{
                if(isgoalpos&&goalPosition === null){
                    console.log('Setting goal position:', pos2);
                    goalPosition = pos2;
                }
                else if(isstartpos&&characterPosition === null){
                    console.log('Setting character position:', pos2);
                    characterPosition = pos2;
                }
                console.log("random");
                drawMap(mazeGrid, cellSize, characterPosition, goalPosition, colorSelect);
                enableAlgorithmAndHeuristic();
            }
        }
    });
    userButton2.addEventListener('click', (event) => {
        event.preventDefault();
        isfinished=true;
        const Div1 = document.querySelector('.butt');
        Div1.classList.add('disabled');
        const Div2 = document.querySelector('.sett');
        Div2.classList.add('disabled');
        const endButton = document.getElementById('goal');
        if (endButton) {
            endButton.disabled = false;
        }
        const startButton = document.getElementById('start');
        if (startButton) {
            startButton.disabled = false;
        }

    });
    startpos.addEventListener('click', (event) => {
        event.preventDefault();
        isstartpos=true;
        startpos.classList.toggle('clicked');
    });
    endpos.addEventListener('click', (event) => {
        event.preventDefault();
        isgoalpos=true;
        endpos.classList.toggle('clicked');
    });

    algorithmSelect.addEventListener('change', () => {
        const selectedAlgorithm = algorithmSelect.value;
        if (selectedAlgorithm === 'uniform-cost') {
            heuristicSelect.disabled = true;
        } else {
            heuristicSelect.disabled = false;
        }
    });

    solveButton.addEventListener('click', () => {
        if (!mazeGrid || !characterPosition || !goalPosition) {
            console.error('Maze grid, character position, or goal position not set.');
            return;
        }
        const algorithm = algorithmSelect.value;
        const heuristicType = heuristicSelect.value;
    
        let result = { path: [], testedNodes: 0, testedNodesList: [] }; // Default result
    
        switch (algorithm) {
            case 'astar':
                result = aStarSearch(mazeGrid, characterPosition, goalPosition, heuristicType);
                break;
            case 'uniform-cost':
                result = uniformCostSearch(mazeGrid, characterPosition, goalPosition);
                break;
            case 'best-first':
                result = bestFirstSearch(mazeGrid, characterPosition, goalPosition, heuristicType);
                break;
            default:
                console.error('Invalid algorithm selected.');
                return;
        }
    
        // Ensure testedNodesList is an array
        if (!Array.isArray(result.testedNodesList)) {
            result.testedNodesList = [];
        }
    
        displayResults(result);
        drawMap(mazeGrid, parseInt(canvas.dataset.cellSize), characterPosition, goalPosition, colorSelect, result.testedNodesList);
        drawPath(result.path, parseInt(canvas.dataset.cellSize));
    });
});
