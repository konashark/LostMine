
var jgl;

var KEYS = {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32 };
var keyState = [];
var spriteLayerCanvas;
var spriteLayerContext;
var backLayerCanvas;
var backLayerContext;
var foreLayerCanvas;
var foreLayerContext;
var walking = false;
var minerX = 320;
var minerY = 40;
var minerCol = parseInt(minerX / 32);
var minerRow = parseInt((minerY - 40) / 32);
var moveX = 0;
var moveY = 0;
var pendingX = 0;
var pendingY = 0;
var moveCounter = 31;

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

    // Initialize the amazing JGL and create a new sprite list
    jgl = new Jgl;

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
                if (canWalk('RIGHT', minerRow, minerCol + 1)) {
                    walking = true;
                    pendingX = 1;
                    pendingY = 0;
                }
                break;

            case KEYS.LEFT:
                if (canWalk('LEFT', minerRow, minerCol - 1)) {
                    walking = true;
                    pendingX = -1;
                    pendingY = 0;
                }
                break;

            case KEYS.UP:
                if (canWalk('UP', minerRow - 1, minerCol)) {
                    walking = true;
                    pendingX = 0;
                    pendingY = -1;
                }
                break;

            case KEYS.DOWN:
                if (canWalk('DOWN', minerRow + 1, minerCol)) {
                    walking = true;
                    pendingX = 0;
                    pendingY = 1;
                }
                break;
        }
    }

    function processKeyUp(ev) {
        keyState[ev.keyCode] = false;
        switch (ev.keyCode)
        {
        }
    }

};

//***********************************************
initSprites = function() {
    var frame;
    spriteList = jgl.newSpriteList();

    // MINER sprite

    miner = spriteList.newSprite({id: 'miner',
        width: 32, height: 32,
        x: minerX, y: minerY,
        animate: false,
        animationSpeed: 10,
        autoLoop: true,
        autoDeactivate: false,
        currentFrame: 0,
        active: true
    });

    miner.setAnimFrame(STAND_DOWN, imageMap, 0, 0, 32, 32);    // Standing still
    miner.setAnimFrame(WALK_DOWN_START, imageMap, 0, 32, 32, 32);    // walking
    miner.setAnimFrame(WALK_DOWN_END, imageMap, 0, 64, 32, 32);    // walking
    miner.setAnimFrame(STAND_UP, imageMap, 32, 0, 32, 32);    // Standing still, facing away
    miner.setAnimFrame(WALK_UP_START, imageMap, 32, 32, 32, 32);    // walking away
    miner.setAnimFrame(WALK_UP_END, imageMap, 32, 64, 32, 32);    // walking away
    miner.setAnimFrame(STAND_LEFT, imageMap, 64, 0, 32, 32);    // standing left
    miner.setAnimFrame(WALK_LEFT_END, imageMap, 96, 0, 32, 32);    // walking left
    miner.setAnimFrame(STAND_RIGHT, imageMap, 64, 32, 32, 32);    // standing right
    miner.setAnimFrame(WALK_RIGHT_END, imageMap, 96, 32, 32, 32);    // walking right
    miner.setAnimFrame(DEAD_LEFT, imageMap, 128, 32, 32, 32);    // dead left
    miner.setAnimFrame(DEAD_RIGHT, imageMap, 128, 0, 32, 32);    // dead right

    // DYNAMITE sprite
    dynamiteSprite = spriteList.newSprite({id: 'dynamite',
        width: 32, height: 32,
        active: false
    });
    dynamiteSprite.setImage(imageMap, 128, 128, 32, 32);

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

    imageMap = jgl.newImage("./images/miner.png", function() {
        initSprites();
        populateMine();
        drawMine();
        animate();

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
        x = jgl.random(20);
        y = jgl.random(8) + 2;
        tileMap[y][x] = jgl.random(6) + 3;
    }
    // Scatter rocks
    for (i = 0; i < 25; i++) {
        x = jgl.random(20);
        y = jgl.random(8) + 2;
        tileMap[y][x] = ROCKS;
    }
    for (i = 0; i < 25; i++) {
        x = jgl.random(20);
        y = jgl.random(8) + 2;
        tileMap[y][x] = ROCK;
    }
};

//***********************************************
var drawMine = function() {
    var row, col, t, tc;
    for (col = 0; col < 20; col++) {
        for (row = 0; row < 10; row++) {
            t = tileMap[row][col];
            if (t !== NOTHING && t !== DUGOUT) {
                tc = tileCoords[t];
                backLayerContext.drawImage(imageMap, tc.x, tc.y, 32, 32, col*32, 40+(row*32), 32, 32);
            }
        }
    }
};

//***********************************************
var canWalk = function(dir, row, col) {
    if (row < 0 || row > 8) { return false; }       // off-screen
    if (col < 0 || col > 19) { return false; }      // off-screen

    var t = tileMap[row][col];
    console.log("TILE @ "+row+","+col+" = " + t);
    if (t === 2 || t === 5) { return false; }       // Rocks
    return true;
};

//***********************************************
var dropDynamite = function(row, col) {
    if (!dynamiteDropped) {
        var x = col * 32;
        var y = 40 + row * 32;
        dynamiteSprite.setPosition(x, y);
        dynamiteSprite.show();
        setTimeout(function() { detonateDynamite(x + 16, y + 16); }, 2000);
    }
};

//***********************************************
var detonateDynamite = function(x, y) {
    dynamiteDropped = false;
    dynamiteSprite.hide();
    explSprite.setAnimActions(true);
    explSprite.setPosition(x, y);
    explSprite.setCurrentFrame(0);
    explSprite.show();
};

//***********************************************
var animate = function(){
    // request new frame
    requestAnimFrame(function(){ animate(); });
    spriteLayerContext.clearRect(0, 0, 640, 360);
    updateMiner();
    spriteList.drawSprites(spriteLayerContext);
};

//***********************************************
var updateMiner = function(){
    if (walking) {
        if (++moveCounter >= 32) {
            moveCounter = 0;
            moveX = pendingX;
            moveY = pendingY;
            pendingX = pendingY = 0;

            if (moveX > 0) {
                miner.setFrameRange(WALK_RIGHT_START, WALK_RIGHT_END, WALK_RIGHT_END);
            } else if (moveX < 0) {
                miner.setFrameRange(WALK_LEFT_START, WALK_LEFT_END, WALK_LEFT_END);
            } else if (moveY > 0) {
                miner.setFrameRange(WALK_DOWN_START, WALK_DOWN_END, WALK_DOWN_END);
            } else if (moveY < 0) {
                miner.setFrameRange(WALK_UP_START, WALK_UP_END, WALK_UP_END);
            }
            miner.setAnimActions(true, true, false);
            if (moveX == 0 && moveY == 0) {
                stopWalking();
            }
        }

        minerX += moveX;
        minerY += moveY;

        if (minerX > 608) {
            minerX = 608;
            stopWalking();
        }
        if (minerY > 320) {
            minerY = 320;
            stopWalking();
        }
        if (minerX < 0) {
            minerX = 0;
            stopWalking();
        }
        if (minerY < 40) {
            minerY = 40;
            stopWalking();
        }

        miner.setPosition(minerX, minerY);
        if (minerY > 71) {
            backLayerContext.beginPath();
            backLayerContext.arc(minerX + 16,minerY + 16,16,0,2*Math.PI);
            backLayerContext.fillStyle = "#200";
            backLayerContext.fill();
        }
    }
};

//***********************************************
var stopWalking = function() {
    var frame = STAND_DOWN;
    if (walking) {
        walking = false;
        moveCounter = 31;
        if (moveX > 0) { frame = STAND_RIGHT; }
        if (moveX < 0) { frame = STAND_LEFT; }
        if (moveY > 0) { frame = STAND_DOWN; }
        if (moveY < 0) { frame = STAND_UP; }
        minerCol = parseInt(minerX / 32);
        minerRow = parseInt((minerY - 40) / 32);
        tileMap[minerRow][minerCol] = DUGOUT;
        console.log("MINER: "+minerRow+','+minerCol);
        miner.setAnimActions(false);
        miner.setCurrentFrame(frame);
    }
    moveX = moveY = pendingX = pendingY = 0;
    console.log("Miner Coordinates: (" + minerX + "," + minerY + ")");
};

window.addEventListener("load", init, false);
