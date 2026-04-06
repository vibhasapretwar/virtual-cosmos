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
    this._onResize  = null;
  }

  async init(container) {
    if (this.destroyed) return;

    this.app = new PIXI.Application();
    await this.app.init({
      width:           container.clientWidth  || CANVAS_WIDTH,
      height:          container.clientHeight || CANVAS_HEIGHT,
      backgroundColor: 0x1a1a2e,
      antialias:       true,
    });

    if (this.destroyed) {
      this.app.destroy(true);
      return;
    }

    this.app.canvas.style.width   = '100%';
    this.app.canvas.style.height  = '100%';
    this.app.canvas.style.display = 'block';
    container.appendChild(this.app.canvas);

    // Handle window resize manually
    this._onResize = () => {
      if (!this.app || this.destroyed) return;
      this.app.renderer.resize(
        container.clientWidth,
        container.clientHeight
      );
    };
    window.addEventListener('resize', this._onResize);

    // Floor grid
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
  showMessage(username, text) {
  if (!this.ready || this.destroyed) return;

  // Find the sprite for this username
  let targetSprite = null;
  for (const [, sprite] of this.sprites) {
    if (sprite.name === username) { targetSprite = sprite; break; }
  }
  if (!targetSprite) return;

  // Create floating message bubble
  const bubble = new PIXI.Text({
    text: `${username}: ${text}`,
    style: {
      fontSize:        12,
      fill:            0xffffff,
      fontFamily:      'sans-serif',
      wordWrap:        true,
      wordWrapWidth:   160,
      dropShadow:      true,
      dropShadowBlur:  4,
      dropShadowColor: 0x000000,
    }
  });

  bubble.anchor.set(0.5, 1);
  bubble.x = targetSprite.container.x;
  bubble.y = targetSprite.container.y - 30;
  this.app.stage.addChild(bubble);

  // Animate: float up and fade out over 2.5s
  let elapsed = 0;
  const ticker = (dt) => {
    elapsed += dt * (1000 / 60);  // convert to ms
    const progress = elapsed / 2500;

    bubble.y -= 0.3 * dt;
    bubble.alpha = 1 - progress;

    // Keep bubble above the correct player as they move
    bubble.x = targetSprite.container.x;

    if (elapsed >= 2500) {
      this.app.ticker.remove(ticker);
      this.app.stage.removeChild(bubble);
      bubble.destroy();
    }
  };
  this.app.ticker.add(ticker);
}

  addPlayer(id, name, x, y, isSelf = false) {
    if (!this.ready || this.destroyed) return;
    if (this.sprites.has(id)) return;
    const sprite = new PlayerSprite(id, name, isSelf);
    sprite.setPosition(x, y);
    sprite.targetX = x;
    sprite.targetY = y;
    this.sprites.set(id, sprite);
    this.app.stage.addChild(sprite.container);
    if (isSelf) this.selfId = id;
  }

  movePlayer(id, x, y) {
    if (!this.ready || this.destroyed) return;
    const sprite = this.sprites.get(id);
    if (!sprite) return;
    sprite.targetX = x;
    sprite.targetY = y;
  }

  removePlayer(id) {
    if (!this.ready || this.destroyed) return;
    const sprite = this.sprites.get(id);
    if (sprite) {
      sprite.destroy();
      this.sprites.delete(id);
    }
  }

  _tick(deltaTime) {
    if (!this.selfId || !this.ready) return;
    const self = this.sprites.get(this.selfId);
    if (!self) return;

    // Self — direct movement, no network lag
    let { x, y } = self.container;
    let moved = false;
    const speed = PLAYER_SPEED * deltaTime;

    if (this.keys.has('ArrowUp')    || this.keys.has('w')) { y -= speed; moved = true; }
    if (this.keys.has('ArrowDown')  || this.keys.has('s')) { y += speed; moved = true; }
    if (this.keys.has('ArrowLeft')  || this.keys.has('a')) { x -= speed; moved = true; }
    if (this.keys.has('ArrowRight') || this.keys.has('d')) { x += speed; moved = true; }

    x = Math.max(20, Math.min(CANVAS_WIDTH  - 20, x));
    y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, y));

    if (moved) {
      self.setPosition(x, y);
      self.targetX = x;
      self.targetY = y;
      this.onMove(x, y);
    }

    // Other players — lerp toward last known server position
    for (const [id, sprite] of this.sprites) {
      if (id === this.selfId) continue;
      if (sprite.targetX === undefined) continue;

      const lerpFactor = Math.min(0.2 * deltaTime, 1);
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
    if (this._onResize)
      window.removeEventListener('resize', this._onResize);
    if (this.app?.canvas)
      this.app.destroy(true, { children: true });
    this.app = null;
  }
}