
var jgl;

var g = {
    KEYS: {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32 },
    keyState: [],
    canvas: null,
    context: null,
    walking: false,
    minerX: 0,
    minerY: 0,
    moveX: 0,
    moveY: 0,
    pendingX: 0,
    pendingY: 0,
    moveCounter: 31
};

var init = function () {

    g.canvas = document.getElementById("canvas");
    g.context = g.canvas.getContext("2d");
    g.context.font = "24px _sans";

    document.addEventListener("keydown", processKeyDown);
    document.addEventListener("keyup", processKeyUp);

    function processKeyDown(ev) {
        console.log("KEY: "+ev.keyCode);
        var frame;

        g.keyState[ev.keyCode] = true;
        switch (ev.keyCode) {
            case 88:
            {
                //g.explSprite.animate = true;
                g.explSprite.setAnimActions(true);
                g.explSprite.setPosition(jgl.random(500) + 100, jgl.random(200) + 100);
                g.explSprite.setCurrentFrame(0);
                g.explSprite.show();
                break;
            }

            case 39:    // RIGHT
                g.walking = true;
                g.pendingX = 1;
                g.pendingY = 0;
                break;

            case 37:    // LEFT
                g.walking = true;
                g.pendingX = -1;
                g.pendingY = 0;
                break;

            case 38:    // UP
                g.walking = true;
                g.pendingX = 0;
                g.pendingY = -1;
                break;

            case 40:    // DOWN
                g.walking = true;
                g.pendingX = 0;
                g.pendingY = 1;
                break;

            case  83:   // S
                g.pendingX = 0;
                g.pendingY = 0;
                break;
        }
    }

    function processKeyUp(ev) {
        g.keyState[ev.keyCode] = false;
        switch (ev.keyCode)
        {
        }
    }

    initSprites();

    animate();
};

//***********************************************
initSprites = function() {
    var frame;
    // Initialize the amazing JGL and create a new sprite list
    jgl = new Jgl;
    g.spriteList = jgl.newSpriteList();

    g.imageMap = new Image();
    g.imageMap.src = "./images/miner.png";
    g.explosionImg = new Image();
    g.explosionImg.src = "./images/explosion.png";

    g.miner = g.spriteList.newSprite({id: 'miner',
        width: 32, height: 32,
        x: g.minerX, y: g.minerY,
        animate: false,
        animationSpeed: 10,
        autoLoop: true,
        autoDeactivate: false,
        currentFrame: 0,
        active: true
    });

    STAND_DOWN = 0;
    WALK_DOWN_START = 1;
    WALK_DOWN_END = 2;
    STAND_UP = 3;
    WALK_UP_START = 4;
    WALK_UP_END = 5;
    STAND_LEFT = 6;
    WALK_LEFT_START = 6;
    WALK_LEFT_END = 7;
    STAND_RIGHT = 8;
    WALK_RIGHT_START = 8;
    WALK_RIGHT_END = 9
    DEAD_LEFT = 10;
    DEAD_RIGHT = 11;

    g.miner.setAnimFrame(STAND_DOWN, g.imageMap, 0, 0, 32, 32);    // Standing still
    g.miner.setAnimFrame(WALK_DOWN_START, g.imageMap, 0, 32, 32, 32);    // walking
    g.miner.setAnimFrame(WALK_DOWN_END, g.imageMap, 0, 64, 32, 32);    // walking
    g.miner.setAnimFrame(STAND_UP, g.imageMap, 32, 0, 32, 32);    // Standing still, facing away
    g.miner.setAnimFrame(WALK_UP_START, g.imageMap, 32, 32, 32, 32);    // walking away
    g.miner.setAnimFrame(WALK_UP_END, g.imageMap, 32, 64, 32, 32);    // walking away
    g.miner.setAnimFrame(STAND_LEFT, g.imageMap, 64, 0, 32, 32);    // standing left
    g.miner.setAnimFrame(WALK_LEFT_END, g.imageMap, 96, 0, 32, 32);    // walking left
    g.miner.setAnimFrame(STAND_RIGHT, g.imageMap, 64, 32, 32, 32);    // standing right
    g.miner.setAnimFrame(WALK_RIGHT_END, g.imageMap, 96, 32, 32, 32);    // walking right
    g.miner.setAnimFrame(DEAD_LEFT, g.imageMap, 128, 32, 32, 32);    // dead left
    g.miner.setAnimFrame(DEAD_RIGHT, g.imageMap, 128, 0, 32, 32);    // dead right

    // Create an EXPLOSION sprite that has multiple frames
    g.explSprite = g.spriteList.newSprite({
        id: 'explosion',
        width: 88, height: 90,
        image: g.explosionImg,
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
        g.explSprite.setAnimFrame(frame, g.explosionImg, frame * 88, 0, 88, 90);
    }
    g.explSprite.setHotSpot(44, 44);
};

//***********************************************
var animate = function(){
    // request new frame
    requestAnimFrame(function(){ animate(); });

    g.context.fillStyle = "#FED";
    g.context.fillRect(0, 0, 640, 360);

    animateMiner();

    g.spriteList.drawSprites(g.context);
};

//***********************************************
var animateMiner = function(){
    if (g.walking) {
        if (++g.moveCounter >= 32) {
            g.moveCounter = 0;
            g.moveX = g.pendingX;
            g.moveY = g.pendingY;

            if (g.moveX > 0) {
                g.miner.setFrameRange(WALK_RIGHT_START, WALK_RIGHT_END, WALK_RIGHT_END);
            } else if (g.moveX < 0) {
                g.miner.setFrameRange(WALK_LEFT_START, WALK_LEFT_END, WALK_LEFT_END);
            } else if (g.moveY > 0) {
                g.miner.setFrameRange(WALK_DOWN_START, WALK_DOWN_END, WALK_DOWN_END);
            } else if (g.moveY < 0) {
                g.miner.setFrameRange(WALK_UP_START, WALK_UP_END, WALK_UP_END);
            }
            g.miner.setAnimActions(true, true, false);
            if (g.moveX == 0 && g.moveY == 0) {
                stopWalking();
            }
        }

        g.minerX += g.moveX;
        g.minerY += g.moveY;

        if (g.minerX > 608) {
            g.minerX = 608;
            stopWalking();
        }
        if (g.minerY > 320) {
            g.minerY = 320;
            stopWalking();
        }
        if (g.minerX < 0) {
            g.minerX = 0;
            stopWalking();
        }
        if (g.minerY < 0) {
            g.minerY = 0;
            stopWalking();
        }

        g.miner.setPosition(g.minerX, g.minerY);
    }
};

//***********************************************
var stopWalking = function() {
    var frame = STAND_DOWN;
    if (g.walking) {
        g.walking = false;
        g.moveCounter = 31;
        if (g.moveX > 0) { frame = STAND_RIGHT; }
        if (g.moveX < 0) { frame = STAND_LEFT; }
        if (g.moveY > 0) { frame = STAND_DOWN; }
        if (g.moveY < 0) { frame = STAND_UP; }
        g.miner.setAnimActions(false);
        g.miner.setCurrentFrame(frame);
    }
    g.moveX = g.moveY = g.pendingX = g.pendingY = 0;
    console.log("Miner Coordinates: (" + g.minerX + "," + g.minerY + ")");
};

window.addEventListener("load", init, false);
