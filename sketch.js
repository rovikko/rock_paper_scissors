/// <reference path="./TSDef/p5.global-mode.d.ts" />
"use strict";

class Item {
  constructor(position, type) {
    this.position = position;
    this.type = type;
  }

  draw() {
    text(this.type, this.position.x, this.position.y);
  }
}

const PAPER_TYPE = "🧻";
const STONE_TYPE = "🗿";
const SCISSORS_TYPE = "🪓";
const MAX_XY = 900;
const FONT_SIZE = 40;
const DIFF_TYPE_COUNT = 30;
const WIN_RADIUS = 10;
const ITEM_MOVE_SPPED = 2;
const SOUND_VOLUME = 0.02;

let w, h;
let ITEMS = [];
let PAPER_SOUND;
let STONE_SOUND;
let SCISSORS_SOUND;
let GAME_ACTIVE = false;

function getRandVector() {
  const pos_x = -MAX_XY / 2 + Math.random() * MAX_XY;
  const pos_y = -MAX_XY / 2 + Math.random() * MAX_XY;

  const position = createVector(pos_x, pos_y);
  return position;
}

function init() {
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
  textSize(FONT_SIZE);

  background(0);
  init();
}

function draw() {
  background(20);

  translate(w / 2, h / 2);

  drawItems();
  if (GAME_ACTIVE) {
    moveItems();
    convertItems();
  } else {
    background(0, 200);
    textStyle();
    fill(255);
    text("CLICK TO START", -150, 0);
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

    const move = closest.position.copy().sub(item.position).normalize();
    item.position.add(move);
    const rand = p5.Vector.random2D().normalize().mult(ITEM_MOVE_SPPED);
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
        tgt.type = item.type;
        playSound(item.type);
      }
    }
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

function mouseClicked() {
  GAME_ACTIVE = true;
}

// const PAPER_TYPE = "🧻";
// const STONE_TYPE = "🗿";
// const SCISSORS_TYPE = "🪓";
