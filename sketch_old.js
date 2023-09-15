/// <reference path="./TSDef/p5.global-mode.d.ts" />
"use strict";

let w, h;

let STONE = [];
let PAPER = [];
let SCISSORS = [];

function setup() {
  w = windowWidth;
  h = windowHeight;

  createCanvas(w, h);
  stroke(255);
  textSize(50);

  background(0);

  init();
  // console.log(STONE_POSITIONS);
}

const PAPER_TYPE = '🧻'
const STONE_TYPE = '🗿'
const SCISSORS_TYPE = '🪓'


class Item {

  constructor(position, type) {
    this.position = position;
    this.type = type;
  }

  draw() {
    text(this.type, this.position.x, this.position.y);
  }
}

const MAX_XY = 800;

function getRandVector() {
  const pos_x = -MAX_XY / 2 + Math.random() * MAX_XY;
  const pos_y = -MAX_XY / 2 + Math.random() * MAX_XY;

  const position = createVector(pos_x, pos_y);
  return position;
}



function draw() {
  background(20);

  translate(w / 2, h / 2);
  strokeWeight(10);

  drawItems();
  moveItems();
}

function drawItems() {
  STONE.forEach((v) => {
    text("🗿", v.x, v.y);
  });
  PAPER.forEach((v) => {
    text("🧻", v.x, v.y);
  });
  SCISSORS.forEach((v) => {
    text("🪓", v.x, v.y);
  });
}

const WIN_RADIUS = 5;

function moveItems() {
  const moveItemToTarget = (items, targets) => {
    const defeatedTargets = [];

    if (targets.length == 0) {
      for (const item of items) {
        // const rand = p5.Vector.random2D().normalize();
        // item.add(rand);
      }
      return defeatedTargets;
    }

    for (const item of items) {
      let tgtIdx = 0;
      let closest = targets[0];
      let mindist = 99999999999;

      for (const tgt of targets) {
        const dist = item.dist(tgt);

        if (dist < mindist) {
          mindist = dist;
          closest = tgt;
          tgtIdx = targets.indexOf(tgt);
        }
      }

      // if (!target) {
      //   throw new Error();
      // }

      const move = closest.copy().sub(item).normalize();
      item.add(move);

      const rand = p5.Vector.random2D().normalize();
      item.add(rand);

      if (item.dist(closest) < WIN_RADIUS && tgtIdx >= 0) {
        defeatedTargets.push(tgtIdx);
      }
    }

    return defeatedTargets;
  };

  // const addToWinner = (defIndices, to, from) => {
  //   for (const di of defIndices) {
  //     to.push(from[di]);
  //   }
  // };

  const addToWinner = (defeated, from, to) => {
    // console.log(defeated)
    for (const idx of defeated) {
      to.push(from[idx]);
    }
    // console.log("added", defeated.length, "now=>", to.length);
  };

  const removeFromDefeated = (defeated, from) => {
    // console.log(defeated)
    for (const di of defeated.sort().reverse()) {
      if (from.length === 1) {
        from.pop();
      } else {
        from.splice(di, 1);
      }
    }
    // console.log("removed, now=>", from.length);
  };

  const defScissors = moveItemToTarget(STONE, SCISSORS);
  addToWinner(defScissors, SCISSORS, STONE);
  removeFromDefeated(defScissors, SCISSORS);


  const defPaper = moveItemToTarget(SCISSORS, PAPER);
  addToWinner(defPaper, PAPER, SCISSORS);
  removeFromDefeated(defPaper, PAPER);
  
  
  const defStone = moveItemToTarget(PAPER, STONE);
  addToWinner(defStone, STONE, PAPER);
  removeFromDefeated(defStone, STONE);

}
