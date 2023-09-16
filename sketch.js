/// <reference path="./TSDef/p5.global-mode.d.ts" />
"use strict";

class Item {
  constructor(position, type) {
    this.position = position;
    this.type = type;
  }

  draw() {
    textSize(EMOJI_FONT_SIZE);
    text(this.type, this.position.x, this.position.y);
  }
}

const PAPER_TYPE = "🧻";
const STONE_TYPE = "🗿";
const SCISSORS_TYPE = "🪓";
const STATES = {
  AFTERINIT: 1,
  PLAYING: 2,
  VICTORY: 3,
};

const MAX_XY = 900;
const EMOJI_FONT_SIZE = 20;
const TEXT_FONT_SIZE = 40;
const DIFF_TYPE_COUNT = 200;
const MAX_ITEMS_NUMBER = DIFF_TYPE_COUNT * 3;
const WIN_RADIUS = 15;
const ITEM_RAND_STEP_SIZE = 4;
const SOUND_VOLUME = 0.02;
const MAX_SOUND_COUNT = 20;

let w, h;
let ITEMS = [];
let PAPER_SOUND;
let STONE_SOUND;
let SCISSORS_SOUND;
let GAME_STATE;
let WINNER;
let MAX_Y, MAX_X;
let SOUND_PLAYED_COUNT = 0;

function getRandVector() {
  const pos_x = -MAX_X / 2 + Math.random() * MAX_X;
  const pos_y = -MAX_Y / 2 + Math.random() * MAX_Y;

  const position = createVector(pos_x, pos_y);
  return position;
}

function init() {
  MAX_Y = h - 50;
  MAX_X = w - 50;

  const stone = new Array(DIFF_TYPE_COUNT)
    .fill(0)
    .map(() => new Item(getRandVector(), STONE_TYPE));

  const paper = new Array(DIFF_TYPE_COUNT)
    .fill(0)
    .map(() => new Item(getRandVector(), PAPER_TYPE));

  const scissors = new Array(DIFF_TYPE_COUNT)
    .fill(0)
    .map(() => new Item(getRandVector(), SCISSORS_TYPE));

  ITEMS = stone.concat(paper, scissors);
}

function drawItems() {
  for (const item of ITEMS) {
    item.draw();
  }
}

function preload() {
  PAPER_SOUND = loadSound("./assets/paper.mp3");
  SCISSORS_SOUND = loadSound("./assets/scissors.mp3");
  STONE_SOUND = loadSound("./assets/stone.mp3");

  PAPER_SOUND.setVolume(SOUND_VOLUME);
  SCISSORS_SOUND.setVolume(SOUND_VOLUME);
  STONE_SOUND.setVolume(SOUND_VOLUME);
}

function setup() {
  w = windowWidth;
  h = windowHeight;

  createCanvas(w, h);
  stroke(255);

  background(0);
  init();

  GAME_STATE = STATES.AFTERINIT;
}

function draw() {
  background(20);
  if (frameCount % 10 == 0) {
    SOUND_PLAYED_COUNT = 0;
  }
  translate(w / 2, h / 2);
  drawItems();

  switch (GAME_STATE) {
    case STATES.AFTERINIT:
      background(0, 200);
      fill(255);
      textSize(TEXT_FONT_SIZE);
      text("CLICK TO START", -160, 0);
      noLoop();
      break;

    case STATES.PLAYING:
      moveItems();
      convertItems();
      checkVictoryCondition();
      break;

    case STATES.VICTORY:
      background(0, 230);
      fill(255);
      textSize(TEXT_FONT_SIZE);
      text(`${WINNER} WINNER ${WINNER}`, -145, 0);
      textSize(20);
      text("CLICK TO RESTART", -100, 40);
      noLoop();
      break;

    default:
      break;
  }
}

function moveItems() {
  const stone = ITEMS.filter((i) => i.type === STONE_TYPE);
  const paper = ITEMS.filter((i) => i.type === PAPER_TYPE);
  const scissors = ITEMS.filter((i) => i.type === SCISSORS_TYPE);

  const targetsMAP = {
    [STONE_TYPE]: scissors,
    [PAPER_TYPE]: stone,
    [SCISSORS_TYPE]: paper,
  };

  for (const item of ITEMS) {
    const targets = targetsMAP[item.type];

    if (targets.length === 0) {
      const rand = p5.Vector.random2D().normalize();
      item.position.add(rand);
      continue;
    }

    let closest = targets[0];
    let mindist = 99999999999;

    for (const tgt of targets) {
      const dist = item.position.dist(tgt.position);

      if (dist < mindist) {
        mindist = dist;
        closest = tgt;
      }
    }

    const move = closest.position.copy().sub(item.position);

    // DEBUG: move lines
    // line(
    //   item.position.x,
    //   item.position.y,
    //   closest.position.x,
    //   closest.position.y
    // );

    move.normalize();

    item.position.add(move);
    const rand = p5.Vector.random2D().normalize().mult(ITEM_RAND_STEP_SIZE);
    item.position.add(rand);
  }
}

function convertItems() {
  const stone = ITEMS.filter((i) => i.type === STONE_TYPE);
  const paper = ITEMS.filter((i) => i.type === PAPER_TYPE);
  const scissors = ITEMS.filter((i) => i.type === SCISSORS_TYPE);

  const targetsMAP = {
    [STONE_TYPE]: scissors,
    [PAPER_TYPE]: stone,
    [SCISSORS_TYPE]: paper,
  };

  for (const item of ITEMS) {
    const targets = targetsMAP[item.type];
    for (const tgt of targets) {
      const dist = item.position.dist(tgt.position);
      if (dist < WIN_RADIUS) {
        // TODO: add statistics how many paper stone and scissors were defeated
        tgt.type = item.type;

        if (SOUND_PLAYED_COUNT < MAX_SOUND_COUNT) {
          playSound(item.type);
          SOUND_PLAYED_COUNT++;
        }

        // TODO: check this break;
        break;
      }
    }
  }
}

function checkVictoryCondition() {
  const paper = ITEMS.filter((v) => v.type === PAPER_TYPE).length;
  const stone = ITEMS.filter((v) => v.type === STONE_TYPE).length;
  const scissors = ITEMS.filter((v) => v.type === SCISSORS_TYPE).length;

  let winner;

  if (paper === MAX_ITEMS_NUMBER) {
    winner = PAPER_TYPE;
  }
  if (stone === MAX_ITEMS_NUMBER) {
    winner = STONE_TYPE;
  }
  if (scissors === MAX_ITEMS_NUMBER) {
    winner = SCISSORS_TYPE;
  }

  if (winner) {
    GAME_STATE = STATES.VICTORY;
    WINNER = winner;
  }
}

function playSound(type) {
  if (type === PAPER_TYPE) {
    PAPER_SOUND.play();
  } else if (type === STONE_TYPE) {
    STONE_SOUND.play();
  } else if (type === SCISSORS_TYPE) {
    SCISSORS_SOUND.play();
  }
}

function restart() {
  ITEMS = [];
  init();
  start();
}

function start() {
  GAME_STATE = STATES.PLAYING;
  loop();
}

function mousePressed() {
  if (GAME_STATE === STATES.AFTERINIT) {
    start();
  }

  if (GAME_STATE === STATES.VICTORY) {
    restart();
  }
}
