const canvas = document.getElementById('canv');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'rgb(40 40 40)';
ctx.fillRect(0, 0, 720, 720); // 720x720 -> (-360->360)x(-360->360)

let twoDimensionalSpace = [[]];
for(let i = 0; i < 720; i ++){
    let temp=[];
    for(let j = 0; j<720; j ++)
        temp.push('rgb(0, 60, 255)')
    twoDimensionalSpace.push(temp);
}


function FullBlue(){ // fill array full with blue (blank)
    for(let i = 0; i < 720; i ++){
        for(let j = 0; j<720; j ++)
            twoDimensionalSpace[i][j] = 'rgb(0, 60, 255)';
    }
}

function AddObject(x, y, color){ // adds object (rect 10x10) into array; for visibility
    // x += 360; y += 360;
    for (let i = x - 5; i < x + 5; i ++){
        for(let j = y - 5; j < y + 5; j ++){
            twoDimensionalSpace[i][j] = color;
        }
    }
}

function DrawPixel(x, y, color) { // draws a pixel in color at specific location
    // x += 360; y += 360;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}
// DrawPixel(100, 100, 'rgb(255, 0, 0)')
function DrawRect(a, b, x, y, color){ // not used; useless
    for (let i = a; i < x; i ++){
        for (let j = a; j < x; j ++){
            DrawPixel(i, j, color)
        }
    }
}
// DrawRect(20, 20, 100, 100, 'rgb(255, 0, 0)')
function GetTwoDim(x, y, z){ // converts 3 dimensions into 2; perspective from front (z = 0 <==> eye)
    // x -= 360; y -= 360;
    return [Math.round(x/z + 360), Math.round(y/z + 360)];
}

function Rotate(x, y, z, th){ //1st, 2nd coordinates, not needed, theta - in radians
    let xp = x*Math.cos(th)-y*Math.sin(th); 
    let yp = x*Math.sin(th)+y*Math.cos(th);
    return [xp, yp]
}

let cube = [[100, 1, 100],[-100, 1, 100], [100, 1, -100], [-100, 1, -100],
            [100, 2, 100],[-100, 2, 100], [100, 2, -100], [-100, 2, -100]]





// console.log(twoDimensionalSpace);

// px′​=cx​+(px​−cx​)⋅cos(θ)−(py​−cy​)⋅sin(θ)
// py′​=cy​+(px​−cx​)⋅sin(θ)+(py​−cy​)⋅cos(θ)


document.addEventListener('keydown', function(event) {
    for(let i = 0; i < 720; i ++){ //draws full array
        for(let j = 0; j < 720; j++){
            DrawPixel(i, j, twoDimensionalSpace[i][j])
        }
    }
    FullBlue();
    for(let i = 4; i < 8; i++){ //adds 4 last vertexes (red color)
        let twoDim = GetTwoDim(cube[i][0], cube[i][2], cube[i][1])
        // DrawPixel(twoDim[0], twoDim[1], 'rgb(191 12 96)');
        // twoDimensionalSpace[twoDim[0]][twoDim[1]] = 'rgb(191 12 96)';
        AddObject(twoDim[0], twoDim[1], 'rgb(191 12 96)'); //rgb(191, 12, 96)
    }
    for(let i = 0; i < 4; i++){ //adds 4 first vertexes (green color)
        let twoDim = GetTwoDim(cube[i][0], cube[i][2], cube[i][1])
        // DrawPixel(twoDim[0], twoDim[1], 'rgb(91 163 46)');
        // twoDimensionalSpace[twoDim[0]][twoDim[1]] = 'rgb(91 163 46)';
        AddObject(twoDim[0], twoDim[1], 'rgb(91 163 46)'); //'rgb(91, 163, 46)'
    }

    for(let i = 0; i < 8; i ++){ // rotates by 0.3 rad
        // TODO: fix problem with round (i think thats the problem) - square becomes smaller every time.
        let after = Rotate(cube[i][0], cube[i][1], cube[i][2],0.3); 
        cube[i] = [Math.round(after[0]), Math.round(after[1]), cube[i][2]];
    }

    console.log(cube);
});
