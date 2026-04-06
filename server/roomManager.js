import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const players = new Map();
const rooms   = new Map();

function randomSpawn() {
  return {
    x: Math.floor(Math.random() * (CANVAS_WIDTH  - 100)) + 50,
    y: Math.floor(Math.random() * (CANVAS_HEIGHT - 100)) + 50,
  };
}

export function addPlayer(id, name) {
  const { x, y } = randomSpawn();
  players.set(id, { id, name, x, y });
}