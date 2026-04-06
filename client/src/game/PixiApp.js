import * as PIXI from "pixi.js";
import { PlayerSprite } from "./PlayerSprite.js";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SPEED,
} from "../../../shared/constants.js";

export class PixiApp {
  constructor(onMove) {
    this.onMove = onMove;
    this.sprites = new Map();
    this.keys = new Set();
    this.selfId = null;
    this.app = null;
    this.world = null;
    this.ready = false;
    this.destroyed = false;

    this._onKeyDown = (e) => this.keys.add(e.key.toLowerCase());
    this._onKeyUp = (e) => this.keys.delete(e.key.toLowerCase());
  }

  async init(container) {
    if (this.destroyed) return;

    this.app = new PIXI.Application();

    await this.app.init({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 0x1a1a2e,
      resizeTo: container,
    });

    if (this.destroyed) {
      this.app.destroy(true);
      return;
    }

    container.appendChild(this.app.canvas);

    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);

    const grid = new PIXI.Graphics();

    for (let x = 0; x < CANVAS_WIDTH; x += 60) {
      grid.moveTo(x, 0).lineTo(x, CANVAS_HEIGHT);
    }

    for (let y = 0; y < CANVAS_HEIGHT; y += 60) {
      grid.moveTo(0, y).lineTo(CANVAS_WIDTH, y);
    }

    grid.stroke({ color: 0xffffff, alpha: 0.05, width: 1 });
    this.world.addChild(grid);

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);

    this.app.ticker.add(() => this._tick());
    this.ready = true;
  }

  addPlayer(id, name, x, y, isSelf = false) {
    if (!this.ready || this.destroyed || !this.world) return;
    if (this.sprites.has(id)) return;

    const sprite = new PlayerSprite(id, name, isSelf);
    sprite.setPosition(x, y);

    this.sprites.set(id, sprite);
    this.world.addChild(sprite.container);

    if (isSelf) {
      this.selfId = id;
    }
  }

  movePlayer(id, x, y) {
    if (!this.ready || this.destroyed) return;

    const sprite = this.sprites.get(id);
    if (!sprite) return;

    if (id === this.selfId) {
      sprite.setPosition(x, y);
    } else {
      sprite.setTargetPosition(x, y);
    }
  }

  removePlayer(id) {
    if (!this.ready || this.destroyed) return;

    const sprite = this.sprites.get(id);
    if (!sprite) return;

    sprite.destroy();
    this.sprites.delete(id);

    if (id === this.selfId) {
      this.selfId = null;
    }
  }

  showMessage(username, text) {
    for (const sprite of this.sprites.values()) {
      if (sprite.name === username) {
        sprite.setMessage(text);
        break;
      }
    }
  }

  _tick() {
    if (!this.selfId || !this.ready || !this.app || !this.world) return;

    for (const [id, sprite] of this.sprites.entries()) {
      if (id !== this.selfId) {
        sprite.updateSmooth(0.15);
      }
    }

    const self = this.sprites.get(this.selfId);
    if (!self) return;

    let { x, y } = self.container;
    let moved = false;

    if (this.keys.has("arrowup") || this.keys.has("w")) {
      y -= PLAYER_SPEED;
      moved = true;
    }

    if (this.keys.has("arrowdown") || this.keys.has("s")) {
      y += PLAYER_SPEED;
      moved = true;
    }

    if (this.keys.has("arrowleft") || this.keys.has("a")) {
      x -= PLAYER_SPEED;
      moved = true;
    }

    if (this.keys.has("arrowright") || this.keys.has("d")) {
      x += PLAYER_SPEED;
      moved = true;
    }

    x = Math.max(20, Math.min(CANVAS_WIDTH - 20, x));
    y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, y));

    if (moved) {
      self.setPosition(x, y);
      this.onMove(x, y);
    }

    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;

    this.world.x = screenW / 2 - self.container.x;
    this.world.y = screenH / 2 - self.container.y;
  }

  destroy() {
    this.destroyed = true;
    this.ready = false;

    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);

    for (const sprite of this.sprites.values()) {
      sprite.destroy();
    }

    this.sprites.clear();
    this.selfId = null;
    this.world = null;

    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}