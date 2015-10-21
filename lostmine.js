
// Initialize the amazing JGL and create a new sprite list
var jgl = new Jgl;

var KEYS = {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32 };
var keyState = [];
var spriteLayerCanvas;
var spriteLayerContext;
var backLayerCanvas;
var backLayerContext;
var foreLayerCanvas;
var foreLayerContext;
var MAP_TOP = 40;
var TILE_SIZE = 32;
var MAP_WIDTH = 20;
var MAP_HEIGHT = 10;

var walking = false;
var minerX = (5 + jgl.random(10)) * TILE_SIZE;
var minerY = MAP_TOP;
var minerCol = parseInt(minerX / TILE_SIZE);
var minerRow = parseInt((minerY - MAP_TOP) / TILE_SIZE);
var moveX = 0;
var moveY = 0;
var pendingX = 0;
var pendingY = 0;
var moveCounter = TILE_SIZE-1;

// Miner Frame Numbers
var STAND_DOWN = 0;
var WALK_DOWN_START = 1;
var WALK_DOWN_END = 2;
var STAND_UP = 3;
var WALK_UP_START = 4;
var WALK_UP_END = 5;
var STAND_LEFT = 6;
var WALK_LEFT_START = 6;
var WALK_LEFT_END = 7;
var STAND_RIGHT = 8;
var WALK_RIGHT_START = 8;
var WALK_RIGHT_END = 9;
var DEAD_LEFT = 10;
var DEAD_RIGHT = 11;

var dynamiteDropped = false;
var dynamiteSprite;

var rockSpriteList = [];

// Tile Map definitions
var NOTHING = -1;
var SURFACE = 0;
var DIRT = 1;
var ROCK = 2;
var SILVER_LG = 3;
var SILVER_SM = 4;
var ROCKS = 5;
var GOLD_MD = 6;
var GOLD_SM = 7;
var GOLD_LG = 8;
var DUGOUT = 9;

var tileMap = [];
var tileCoords = [{x:96, y:128},{x:0, y:96},{x:32, y:96},{x:64, y:96},{x:96, y:96},{x:128, y:96},{x:0, y:128},{x:32, y:128},{x:64, y:128}];

//***********************************************
var init = function () {
    var i;

    initLayers();

    //spriteLayerContext.font = "24px _sans";

    document.addEventListener("keydown", processKeyDown);
    document.addEventListener("keyup", processKeyUp);

    function processKeyDown(ev) {
//        console.log("KEY: "+ev.keyCode);
        var tile;

        keyState[ev.keyCode] = true;
        switch (ev.keyCode) {
            case 88:    // X - dynamite
                dropDynamite(minerRow, minerCol);
                break;

            case KEYS.RIGHT:
                pendingX = 1; pendingY = 0;
                break;

            case KEYS.LEFT:
                pendingX = -1; pendingY = 0;
                break;

            case KEYS.UP:
                pendingX = 0; pendingY = -1;
                break;

            case KEYS.DOWN:
                pendingX = 0; pendingY = 1;
                break;
        }
    }

    function processKeyUp(ev) {
        keyState[ev.keyCode] = false;
    }

};

//***********************************************
initSprites = function() {
    var frame;
    spriteList = jgl.newSpriteList();

    // MINER sprite

    miner = spriteList.newSprite({id: 'miner',
        width: TILE_SIZE, height: TILE_SIZE,
        x: minerX, y: minerY,
        animate: false,
        animationSpeed: 10,
        autoLoop: true,
        autoDeactivate: false,
        currentFrame: 0,
        active: true
    });

    miner.setAnimFrame(STAND_DOWN, imageMap, 0, 0, TILE_SIZE, TILE_SIZE);    // Standing still
    miner.setAnimFrame(WALK_DOWN_START, imageMap, 0, 32, TILE_SIZE, TILE_SIZE);    // walking
    miner.setAnimFrame(WALK_DOWN_END, imageMap, 0, 64, TILE_SIZE, TILE_SIZE);    // walking
    miner.setAnimFrame(STAND_UP, imageMap, 32, 0, TILE_SIZE, TILE_SIZE);    // Standing still, facing away
    miner.setAnimFrame(WALK_UP_START, imageMap, 32, 32, TILE_SIZE, TILE_SIZE);    // walking away
    miner.setAnimFrame(WALK_UP_END, imageMap, 32, 64, TILE_SIZE, TILE_SIZE);    // walking away
    miner.setAnimFrame(STAND_LEFT, imageMap, 64, 0, TILE_SIZE, TILE_SIZE);    // standing left
    miner.setAnimFrame(WALK_LEFT_END, imageMap, 96, 0, TILE_SIZE, TILE_SIZE);    // walking left
    miner.setAnimFrame(STAND_RIGHT, imageMap, 64, 32, TILE_SIZE, TILE_SIZE);    // standing right
    miner.setAnimFrame(WALK_RIGHT_END, imageMap, 96, 32, TILE_SIZE, TILE_SIZE);    // walking right
    miner.setAnimFrame(DEAD_LEFT, imageMap, 128, 32, TILE_SIZE, TILE_SIZE);    // dead left
    miner.setAnimFrame(DEAD_RIGHT, imageMap, 128, 0, TILE_SIZE, TILE_SIZE);    // dead right

    // DYNAMITE sprite
    dynamiteSprite = spriteList.newSprite({id: 'dynamite', width: TILE_SIZE, height: TILE_SIZE, active: false });
    dynamiteSprite.setImage(imageMap, 128, 64, TILE_SIZE, TILE_SIZE);

    // EXPLOSION sprite
    explSprite = spriteList.newSprite({
        id: 'explosion',
        width: 88, height: 90,
        image: explosionImg,
        animate: true,
        autoLoop: false,
        autoDeactivate: true,
        currentFrame: 0,
        startFrame: 0,
        endFrame: 39,
        active: false
    });

    // Define animation frames
    for (frame = 0; frame < 40; frame++) {
        explSprite.setAnimFrame(frame, explosionImg, frame * 88, 0, 88, 90);
    }
    explSprite.setHotSpot(44, 44);

};

//***********************************************
var initLayers = function() {
    var i, x, y, t, tc;

    explosionImg = jgl.newImage("./images/explosion.png");

    backLayerCanvas = document.getElementById("backLayer");
    backLayerContext = backLayerCanvas.getContext("2d");
    backLayerContext.fillStyle = "#410";
    backLayerContext.fillRect(0, 0, 640, 360);
    jgl.newImage('./images/hills.jpg', function(image) {
        backLayerContext.drawImage(image, 0, 0, 640, 83, 0, 0, 640, 83);
    });

    jgl.newImage("./images/miner.png", function(image) {
        imageMap = image;
        setTimeout(function() {
            initSprites();
            populateMine();
        drawMine();
        animate();
        }, 100);
    });

    spriteLayerCanvas = document.getElementById("spriteLayer");
    spriteLayerContext = spriteLayerCanvas.getContext("2d");
    spriteLayerContext.clearRect(0, 0, 640, 360);

    /*
     foreLayerCanvas = document.getElementById("foreLayer");
     foreLayerContext = foreLayerCanvas.getContext("2d");

     foreLayerContext.clearRect(0, 0, 640, 360);
    jgl.newImage('./images/frame.png', function(image) {
        foreLayerContext.drawImage(image, 0, 0, 640, 360, 0, 0, 640, 360);
    });
    */
};

//***********************************************
var populateMine = function() {
    var i, x, y;

    tileMap.push([  NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,
        NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,NOTHING,NOTHING]);

    tileMap.push([  SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,
                SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,SURFACE,SURFACE]);

    // Fill the tileMap with plain dirt
    for (i = 0; i < 8; i++) {
        var row = [DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT,DIRT];
        tileMap.push(row);
    }
    // Scatter treasure
    var treasures = jgl.random(20) + 1;
    for (i = 0; i < treasures; i++) {
        x = jgl.random(MAP_WIDTH);
        y = jgl.random(MAP_HEIGHT - 2) + 2;
        tileMap[y][x] = jgl.random(6) + 3;
    }
    // Scatter rocks
    for (i = 0; i < 25; i++) {
        x = jgl.random(MAP_WIDTH);
        y = jgl.random(MAP_HEIGHT - 2) + 2;
        tileMap[y][x] = ROCKS;
    }
    for (i = 0; i < 25; i++) {
        x = jgl.random(MAP_WIDTH);
        y = jgl.random(MAP_HEIGHT - 2) + 2;
        tileMap[y][x] = ROCK;
    }

    // Set all tiles below ground element to be hidden
    var row, col;
    for (col = 0; col < MAP_WIDTH; col++) {
        for (row = 2; row < MAP_HEIGHT; row++) {
            tileMap[row][col] = tileMap[row][col] + 100;
        }
    }
};

//***********************************************
var drawMine = function() {
    var row, col, t, tc;
    for (col = 0; col < MAP_WIDTH; col++) {
        for (row = 0; row < MAP_HEIGHT; row++) {
            t = tileMap[row][col];
            if (t >= 99) { // it's currently hidden
                backLayerContext.drawImage(imageMap, 128, 128, TILE_SIZE, TILE_SIZE, col*TILE_SIZE, MAP_TOP+(row*TILE_SIZE), TILE_SIZE, TILE_SIZE);
            } else {
                if (t !== NOTHING && t !== DUGOUT) {
                    tc = tileCoords[t];
                    backLayerContext.drawImage(imageMap, tc.x, tc.y, TILE_SIZE, TILE_SIZE, col*TILE_SIZE, MAP_TOP+(row*TILE_SIZE), TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
};

//***********************************************
var revealTiles = function (minerRow, minerCol) {
    revealTile(minerRow+1, minerCol);
    revealTile(minerRow-1, minerCol);
    revealTile(minerRow, minerCol+1);
    revealTile(minerRow, minerCol-1);
};

//***********************************************
var revealTile = function(row, col) {
    if (row < 0 || row >= MAP_HEIGHT || col < 0 || col >= MAP_WIDTH) { return };

    t = tileMap[row][col];
    if (t >= 99) { // it's currently hidden
        t -= 100;  // not hidden flag
    }
    tileMap[row][col] = t;
    if (t !== NOTHING && t !== DUGOUT) {
        drawTile(t, row, col);
    }
};

//***********************************************
var drawTile = function(t, row, col) {
    if (row < 1 || row >= MAP_HEIGHT || col < 0 || col >= MAP_WIDTH) { return };

    tileMap[row][col] = t;
    if (t == DUGOUT) {
        backLayerContext.fillStyle = "#200";
        backLayerContext.fillRect(col*TILE_SIZE, MAP_TOP+(row*TILE_SIZE), TILE_SIZE, TILE_SIZE);
    } else {
        if (t !== NOTHING && t < tileCoords.length) {
            var tc = tileCoords[t];
            backLayerContext.drawImage(imageMap, tc.x, tc.y, TILE_SIZE, TILE_SIZE, col*TILE_SIZE, MAP_TOP+(row*TILE_SIZE), TILE_SIZE, TILE_SIZE);
        }
    }
};

//***********************************************
var canWalk = function(row, col) {
    if (row < 0 || row >= MAP_HEIGHT) { return false; }       // off-screen
    if (col < 0 || col >= MAP_WIDTH) { return false; }      // off-screen

    var t = tileMap[row][col];
    console.log("TILE @ "+row+","+col+" = " + t);
    if (t === ROCK || t === ROCKS || t === ROCK+100 || t === ROCKS+100) { return false; }       // Rocks
    return true;
};

//***********************************************
var dropDynamite = function(row, col) {
    if (!dynamiteDropped) {
        var x = col * TILE_SIZE;
        var y = MAP_TOP + row * TILE_SIZE;
        dynamiteSprite.setPosition(x, y);
        dynamiteSprite.show();
        setTimeout(function() { detonateDynamite(row, col); }, 2000);
    }
};

//***********************************************
var detonateDynamite = function(row, col) {
    var x = col * TILE_SIZE + 16;
    var y = MAP_TOP + row * TILE_SIZE + 16;
    dynamiteDropped = false;
    dynamiteSprite.hide();
    explSprite.setRotation(jgl.random(360));
    explSprite.setAnimActions(true);
    explSprite.setPosition(x, y);
    explSprite.setCurrentFrame(0);
    explSprite.setAnimFrameCallback(10, function() { dynamiteAftermath(row, col); });
    explSprite.show();
};

//***********************************************
var dynamiteAftermath = function(row, col) {
    console.log("Dynamite exploded at "+row+","+col);
    var i, r, c, x, y;

    for (r = row-1; r < row+2; r++) {
        for (c = col-1; c < col+2; c++) {
            if (r > 0 && r < MAP_HEIGHT && c >= 0 && c < MAP_WIDTH) {
                drawTile(DUGOUT, r, c);
            }
        }
    }

    if ((Math.abs(minerCol - col) < 2 && minerRow == row) || (Math.abs(minerRow - row) < 2 && minerCol == col)) {
        // in the blast path
        die();
    }

    testRocks();
};

//***********************************************
var die = function() {
    console.log("Miner is dead!");
    walking = false;
    miner.setAnimActions(false);
    miner.setCurrentFrame(DEAD_LEFT);
    minerY = MAP_TOP + (minerRow * TILE_SIZE);
    minerX = (minerCol * TILE_SIZE);
};

//***********************************************
var testRocks = function() {
    var r, c;
    for (r = 2; r < MAP_HEIGHT - 1; r++) {
        for (c = 0; c < MAP_WIDTH; c++) {
            var t = tileMap[r][c];
            if (t == ROCK || t == ROCKS) {
                if (tileMap[r+1][c] == DUGOUT) {
                    dropRock(t, r, c, 1000);
                }
            }
        }
    }
};

//***********************************************
var dropRock = function(rock, row, col, delay) {
    console.log("Dropping rock!");
    drawTile(DUGOUT, row, col);
    var rockSprite = spriteList.newSprite({id: 'rock',
        width: TILE_SIZE, height: TILE_SIZE,
        x: col * TILE_SIZE,
        y: MAP_TOP + (row * TILE_SIZE),
        active: true });
    rockSprite.setImage(imageMap, tileCoords[rock].x, tileCoords[rock].y, TILE_SIZE, TILE_SIZE);
    rockSprite.user.targetY = MAP_TOP + ((row  + 1) * TILE_SIZE);
    rockSprite.user.tile = rock;
    setTimeout(function() {
        rockSpriteList.push(rockSprite);
    }, delay);
};

//***********************************************
var updateRocks = function() {
    for (var i = 0; i < rockSpriteList.length; i++) {
        var rs = rockSpriteList[i];
        if (rs.y < rs.user.targetY) {
            rs.y++;
        } else {
            var row = parseInt((rs.y - MAP_TOP) / TILE_SIZE);
            var col = parseInt(rs.x / TILE_SIZE);
            drawTile(rs.user.tile, row, col);
            rockSpriteList.splice(i,1); i--;
            spriteList.deleteSprite(rs);
            if (row == minerRow && col == minerCol) {
                die();
            }
            if ((row < MAP_HEIGHT - 2) && (tileMap[row+1][col] == DUGOUT)) {
                dropRock(rs.user.tile, row, col, 0);
            }
        }
        if (spriteList.collision(rockSpriteList[i], miner, 6, true)) {
            die();
        }
    }
};

//***********************************************
var animate = function(){
    // request new frame
    requestAnimFrame(function(){ animate(); });
    spriteLayerContext.clearRect(0, 0, 640, 360);
    updateMiner();
    testRocks();
    updateRocks();
    spriteList.drawSprites(spriteLayerContext);
};

//***********************************************
var updateMiner = function(){
    if (walking || pendingX || pendingY) {  // If currently moving, or about to start
        // Every 32 movements equals 1 tile. At each completion, we re-analyze the situation
        if (++moveCounter >= TILE_SIZE) {
            moveCounter = 0;
            moveX = moveY = 0;
            minerCol = parseInt(minerX / TILE_SIZE);
            minerRow = parseInt((minerY - MAP_TOP) / TILE_SIZE);

            if (pendingX || pendingY) {
                if (pendingX > 0 && canWalk(minerRow, minerCol + 1)) {
                    walking = true;
                    moveX = 1;
                } else
                if (pendingX < 0 && canWalk(minerRow, minerCol - 1)) {
                    walking = true;
                    moveX = -1;
                }
                if (pendingY < 0 && canWalk(minerRow - 1, minerCol)) {
                    walking = true;
                    moveY = -1;
                } else
                if (pendingY > 0 && canWalk(minerRow + 1, minerCol)) {
                    walking = true;
                    moveY = 1;
                }
            }
            pendingX = pendingY = 0;

            // Set the animation frame based on which direction we are walking
            if (moveX > 0) {
                miner.setFrameRange(WALK_RIGHT_START, WALK_RIGHT_END, WALK_RIGHT_END);
            } else if (moveX < 0) {
                miner.setFrameRange(WALK_LEFT_START, WALK_LEFT_END, WALK_LEFT_END);
            } else if (moveY > 0) {
                miner.setFrameRange(WALK_DOWN_START, WALK_DOWN_END, WALK_DOWN_END);
            } else if (moveY < 0) {
                miner.setFrameRange(WALK_UP_START, WALK_UP_END, WALK_UP_END);
            }

            // Mark the new tile as visited
            drawTile(DUGOUT, minerRow, minerCol);
            revealTiles(minerRow, minerCol);
            console.log("MINER: " + minerRow + ',' + minerCol);

            if (moveX || moveY) {
                miner.setAnimActions(true, true, false);
            } else {
                stopWalking();
            }
        }

        minerX += moveX;
        minerY += moveY;

        // Draw a filled circle (the dug out area) to our bitmap
        miner.setPosition(minerX, minerY);
        if (minerY > MAP_TOP + TILE_SIZE - 1) {
            backLayerContext.beginPath();
            backLayerContext.arc(minerX + 16, minerY + 16, 16, 0, 2 * Math.PI);
            backLayerContext.fillStyle = "#200";
            backLayerContext.fill();
        }
    } else {
        moveCounter = TILE_SIZE - 1;
    }
};

//***********************************************
var stopWalking = function() {
    var frame = STAND_DOWN;
    if (walking) {
        walking = false;
        moveCounter = TILE_SIZE - 1;
        if (moveX > 0) { frame = STAND_RIGHT; }
        if (moveX < 0) { frame = STAND_LEFT; }
        if (moveY > 0) { frame = STAND_DOWN; }
        if (moveY < 0) { frame = STAND_UP; }
        miner.setAnimActions(false);
        miner.setCurrentFrame(frame);
    }
    moveX = moveY = pendingX = pendingY = 0;
    console.log("Miner Coordinates: (" + minerX + "," + minerY + ")");
};

window.addEventListener("load", init, false);
