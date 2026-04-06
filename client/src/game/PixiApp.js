import * as PIXI from 'pixi.js';
import { PlayerSprite } from './PlayerSprite.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SPEED } from '../shared/constants.js';

export class PixiApp {
  constructor(onMove) {
    this.onMove    = onMove;
    this.sprites   = new Map();
    this.keys      = new Set();
    this.selfId    = null;
    this.app       = null;
    this.ready     = false;
    this.destroyed = false;

    this._onKeyDown = (e) => this.keys.add(e.key);
    this._onKeyUp   = (e) => this.keys.delete(e.key);
  }

  async init(container) {
    if (this.destroyed) return;

    this.app = new PIXI.Application();
    await this.app.init({
      width:           CANVAS_WIDTH,
      height:          CANVAS_HEIGHT,
      backgroundColor: 0x1a1a2e,
      resizeTo:        container,
    });

    if (this.destroyed) { this.app.destroy(true); return; }

    container.appendChild(this.app.canvas);

    const grid = new PIXI.Graphics();
    for (let x = 0; x < CANVAS_WIDTH; x += 60)
      grid.moveTo(x, 0).lineTo(x, CANVAS_HEIGHT);
    for (let y = 0; y < CANVAS_HEIGHT; y += 60)
      grid.moveTo(0, y).lineTo(CANVAS_WIDTH, y);
    grid.stroke({ color: 0xffffff, alpha: 0.05, width: 1 });
    this.app.stage.addChild(grid);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
    this.app.ticker.add((ticker) => this._tick(ticker.deltaTime));
    this.ready = true;
  }

  addPlayer(id, name, x, y, isSelf = false) {
    if (!this.ready || this.destroyed) return;
    if (this.sprites.has(id)) return;
    const sprite = new PlayerSprite(id, name, isSelf);
    sprite.setPosition(x, y);
    this.sprites.set(id, sprite);
    this.app.stage.addChild(sprite.container);
    if (isSelf) this.selfId = id;
  }

  // For OTHER players — interpolate toward target position smoothly
  movePlayer(id, x, y) {
    if (!this.ready || this.destroyed) return;
    const sprite = this.sprites.get(id);
    if (!sprite) return;
    // Set target, actual movement happens in _tick via lerp
    sprite.targetX = x;
    sprite.targetY = y;
  }

  removePlayer(id) {
    if (!this.ready || this.destroyed) return;
    const sprite = this.sprites.get(id);
    if (sprite) { sprite.destroy(); this.sprites.delete(id); }
  }

  _tick(deltaTime) {
    if (!this.selfId || !this.ready) return;
    const self = this.sprites.get(this.selfId);
    if (!self) return;

    // --- Self: direct movement, no network lag ---
    let { x, y } = self.container;
    let moved = false;
    const speed = PLAYER_SPEED * deltaTime;  // frame-rate independent

    if (this.keys.has('ArrowUp')    || this.keys.has('w')) { y -= speed; moved = true; }
    if (this.keys.has('ArrowDown')  || this.keys.has('s')) { y += speed; moved = true; }
    if (this.keys.has('ArrowLeft')  || this.keys.has('a')) { x -= speed; moved = true; }
    if (this.keys.has('ArrowRight') || this.keys.has('d')) { x += speed; moved = true; }

    x = Math.max(20, Math.min(CANVAS_WIDTH  - 20, x));
    y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, y));

    if (moved) {
      self.setPosition(x, y);
      this.onMove(x, y);   // tell server (others will see it)
    }

    // --- Other players: lerp toward last known server position ---
    for (const [id, sprite] of this.sprites) {
      if (id === this.selfId) continue;
      if (sprite.targetX === undefined) continue;

      const lerpFactor = 0.2 * deltaTime;  // tune 0.1–0.3
      const nx = sprite.container.x + (sprite.targetX - sprite.container.x) * lerpFactor;
      const ny = sprite.container.y + (sprite.targetY - sprite.container.y) * lerpFactor;
      sprite.setPosition(nx, ny);
    }
  }

  destroy() {
    this.destroyed = true;
    this.ready     = false;
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
    if (this.app?.canvas) this.app.destroy(true, { children: true });
    this.app = null;
  }
}