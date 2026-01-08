const canvas = document.getElementById('canv');
const ctx = canvas.getContext('2d');
const SCREEN_SIZE_X = 720;
const SCREEN_SIZE_Y = 720;
const BACKGROUND = 'rgb(40, 40, 40)';
const DRAWING_COLOR = 'rgb(146, 227, 33)';
const DRAWING_SIZE = 10;
const FPS = 40;
const X_OR_Y_COORD = 0.7;
const Z_FRONT = 2;
const Z_BACK = 3.4;
const ROTATING_ANGLE = Math.PI/64;
const ROTATION_AXIS_X = 0;
const ROTATION_AXIS_Z = (Z_BACK-Z_FRONT)/2 + Z_FRONT;




function FillBackground(){
    ctx.fillStyle = BACKGROUND; // fill with background
    ctx.fillRect(0, 0, SCREEN_SIZE_X, SCREEN_SIZE_Y); // 720x720 -> (-360->360)x(-360->360)
}
FillBackground();

// next two functions are for getting coords in (0-SCREEN_SIZE_X)x(0-SCREEN_SIZE_y) from (-1, 1)x(-1, 1)
function GetFillableCoordX(coord){
    return coord * SCREEN_SIZE_X/2 + SCREEN_SIZE_X/2;
}
function GetFillableCoordY(coord){
    return -1 * coord * SCREEN_SIZE_Y/2 + SCREEN_SIZE_Y/2;
}


function DrawVert(x, y){ // draws a vertex with size of DRAWING_SIZE, used mainly when debugging
    ctx.fillStyle = DRAWING_COLOR;
    ctx.fillRect(GetFillableCoordX(x) - DRAWING_SIZE/2, GetFillableCoordY(y) - DRAWING_SIZE/2, DRAWING_SIZE, DRAWING_SIZE);
}

function Sleep(time) { // sleep function, needed in main loop
    return new Promise(resolve => setTimeout(resolve, time));
}

// x' = x/z
// y' = y/z
// ^ that formula is used here
// it is for getting a 2D coords from 3D
// this assumes z=0 is 'in' the eye and positive are infront
function ConvertTo2D(x, z, y){
    return [x/z, y/z];
}

// x′=cx​+(x−cx​)⋅cos(θ)−(y−cy​)⋅sin(θ)
// y′=cy​+(x−cx​)⋅sin(θ)+(y−cy​)⋅cos(θ)
// ^ that formula used here for rotating vertexes
function Rotate(x, y, th, px, py){
    //TODO: write new rotate for rotating around point in space not an axis
    return [
        px+(x-px)*Math.cos(th)-(y-py)*Math.sin(th),
        py+(x-px)*Math.sin(th)+(y-py)*Math.cos(th)
    ];
}

function ConnectDots(x, y, dx, dy){ // connects vertexes
    x = GetFillableCoordX(x);
    y = GetFillableCoordY(y);
    dx = GetFillableCoordX(dx);
    dy = GetFillableCoordY(dy);
    ctx.strokeStyle = DRAWING_COLOR;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(dx, dy);
    ctx.stroke();
}

// let cube = [
//     [0.7, 2.4, 0.7], [0.7, 2.4, -0.7], [-0.7, 2.4, -0.7], [-0.7, 2.4, 0.7], // back:  top right, bott right, bott left, top left
//     [0.7, 1, 0.7], [0.7, 1, -0.7], [-0.7, 1, -0.7], [-0.7, 1, 0.7]  // front: top right, bott right, bott left, top left
// ];

let cube = [ // example of an object (cube). Higher is a specific one with descriptions of where are the vertexes
    [X_OR_Y_COORD, Z_BACK, X_OR_Y_COORD], [X_OR_Y_COORD, Z_BACK, -X_OR_Y_COORD],
    [-X_OR_Y_COORD, Z_BACK, -X_OR_Y_COORD], [-X_OR_Y_COORD, Z_BACK, X_OR_Y_COORD],
    [X_OR_Y_COORD, Z_FRONT, X_OR_Y_COORD], [X_OR_Y_COORD, Z_FRONT, -X_OR_Y_COORD],
    [-X_OR_Y_COORD, Z_FRONT, -X_OR_Y_COORD], [-X_OR_Y_COORD, Z_FRONT, X_OR_Y_COORD]
];

let convertedCube = [ // array used in main loop
    [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]
];

function ConnectTheCube(){ // not a clean one but works; written by hand
    // TODO: write a function for that 
    ConnectDots(convertedCube[0][0], convertedCube[0][1], convertedCube[1][0], convertedCube[1][1]);
    ConnectDots(convertedCube[0][0], convertedCube[0][1], convertedCube[3][0], convertedCube[3][1]);
    ConnectDots(convertedCube[0][0], convertedCube[0][1], convertedCube[4][0], convertedCube[4][1]);
    ConnectDots(convertedCube[7][0], convertedCube[7][1], convertedCube[4][0], convertedCube[4][1]);
    ConnectDots(convertedCube[7][0], convertedCube[7][1], convertedCube[6][0], convertedCube[6][1]);
    ConnectDots(convertedCube[7][0], convertedCube[7][1], convertedCube[3][0], convertedCube[3][1]);
    ConnectDots(convertedCube[2][0], convertedCube[2][1], convertedCube[3][0], convertedCube[3][1]);
    ConnectDots(convertedCube[2][0], convertedCube[2][1], convertedCube[1][0], convertedCube[1][1]);
    ConnectDots(convertedCube[2][0], convertedCube[2][1], convertedCube[6][0], convertedCube[6][1]);
    ConnectDots(convertedCube[5][0], convertedCube[5][1], convertedCube[6][0], convertedCube[6][1]);
    ConnectDots(convertedCube[5][0], convertedCube[5][1], convertedCube[4][0], convertedCube[4][1]);
    ConnectDots(convertedCube[5][0], convertedCube[5][1], convertedCube[1][0], convertedCube[1][1]);
}


async function Execute(){ // main loop (in function because of sleep)
    while(true){
        FillBackground();
        for(let i = 0; i < 8; i ++){ // converts cube vertexes into drawable 2D points; commented out drawing of these points
            let converted = ConvertTo2D(cube[i][0], cube[i][1], cube[i][2]);
            convertedCube[i] = converted;
            // DrawVert(converted[0], converted[1]);
        }
        ConnectTheCube(); // connects the vertexes, here only this draws something
        for (let i = 0; i < 8; i ++){ // rotates every vertex of the cube
            let rotated = Rotate(cube[i][0], cube[i][1], ROTATING_ANGLE, ROTATION_AXIS_X, ROTATION_AXIS_Z);
            cube[i] = [rotated[0], rotated[1], cube[i][2]];
        }
        await Sleep(1000/FPS);
    }
}
Execute();


// left around code from previous work (previous commit and some work before this one (i decided to write new code)). Will delete next commit



// let twoDimensionalSpace = [[]];
// for(let i = 0; i < 72; i ++){
//     let temp=[];
//     for(let j = 0; j<72; j ++)
//         temp.push('rgb(0, 60, 255)')
//     twoDimensionalSpace.push(temp);
// }


// function FullBlue(){ // fill array full with blue (blank)
//     for(let i = 0; i < 72; i ++){
//         for(let j = 0; j<72; j ++)
//             twoDimensionalSpace[i][j] = 'rgb(0, 60, 255)';
//     }
// }

// function AddObject(x, y, color){ // adds object (rect 10x10) into array; for visibility
//     // x += 360; y += 360;
//     for (let i = x - 5; i < x + 5; i ++){
//         for(let j = y - 5; j < y + 5; j ++){
//             twoDimensionalSpace[i][j] = color;
//         }
//     }
// }

// function DrawPixel(x, y, color) { // draws a pixel in color at specific location
//     // x += 360; y += 360;
//     ctx.fillStyle = color;
//     ctx.fillRect(x*10, y*10, 10, 10);
// }
// // DrawPixel(100, 100, 'rgb(255, 0, 0)')
// function DrawRect(a, b, x, y, color){ // not used; useless
//     for (let i = a; i < x; i ++){
//         for (let j = a; j < x; j ++){
//             DrawPixel(i, j, color);
//         }
//     }
// }
// // DrawRect(20, 20, 100, 100, 'rgb(255, 0, 0)')
// function GetTwoDim(x, y, z){ // converts 3 dimensions into 2; perspective from front (z = 0 <==> eye)
//     // x -= 360; y -= 360;
//     return [Math.round(x/z + 36), Math.round(y/z + 36)];
// }

// function Rotate(x, y, z, th){ //1st, 2nd coordinates, not needed, theta - in radians
//     let xp = x*Math.cos(th)-y*Math.sin(th); 
//     let yp = x*Math.sin(th)+y*Math.cos(th);
//     return [xp, yp];
// }

// let cube = [[1, 2, 1],[-1, 2, 1], [1, 2, -1], [-1, 2, -1],
//             [1, 5, 1],[-1, 5, 1], [1, 5, -1], [-1, 5, -1]]; 


        


// // console.log(twoDimensionalSpace);

// // px′​=cx​+(px​−cx​)⋅cos(θ)−(py​−cy​)⋅sin(θ)
// // py′​=cy​+(px​−cx​)⋅sin(θ)+(py​−cy​)⋅cos(θ)


// document.addEventListener('keydown', function(event) {
//     for(let i = 0; i < 72; i ++){ //draws full array
//         for(let j = 0; j < 72; j++){
//             DrawPixel(i, j, twoDimensionalSpace[i][j]);
//         }
//     }
//     console.log(cube);
//     FullBlue();
//     for(let i = 4; i < 8; i++){ //adds 4 last vertexes (red color)
//         let twoDim = GetTwoDim(cube[i][0], cube[i][2], cube[i][1]);
//         // DrawPixel(twoDim[0], twoDim[1], 'rgb(191 12 96)');
//         twoDimensionalSpace[twoDim[0]][twoDim[1]] = 'rgb(191, 12, 96)';
//         // AddObject(twoDim[0], twoDim[1], 'rgb(191 12 96)'); //rgb(191, 12, 96)
//     }
//     for(let i = 0; i < 4; i++){ //adds 4 first vertexes (green color)
//         let twoDim = GetTwoDim(cube[i][0], cube[i][2], cube[i][1]);
//         // DrawPixel(twoDim[0], twoDim[1], 'rgb(91 163 46)');
//         twoDimensionalSpace[twoDim[0]][twoDim[1]] = 'rgb(91, 163, 46)';
//         // AddObject(twoDim[0], twoDim[1], 'rgb(91 163 46)'); //'rgb(91, 163, 46)'
//     }

//     for(let i = 0; i < 8; i ++){ // rotates (rad)
//         // TODO: fix problem with round (i think thats the problem) - square becomes smaller every time.
//         let after = Rotate(cube[i][0], cube[i][1], cube[i][2], Math.PI/4); 
//         cube[i] = [Math.round(after[0]), Math.round(after[1]), cube[i][2]];
//     }

// });
