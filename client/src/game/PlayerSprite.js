import * as PIXI from "pixi.js";
import { PROXIMITY_RADIUS } from "../shared/constants.js";

export class PlayerSprite {
  constructor(id, name, isSelf = false) {
    this.id = id;
    this.name = name;
    this.isSelf = isSelf;
    this.container = new PIXI.Container();

    this.targetX = 0;
    this.targetY = 0;
    this.messageBubble = null;
    this.messageTimeout = null;

    const primaryColor = isSelf ? 0x8b5cf6 : 0x10b981;
    const outerColor = isSelf ? 0xc4b5fd : 0x6ee7b7;

    if (isSelf) {
      const ring = new PIXI.Graphics();
      ring.circle(0, 0, PROXIMITY_RADIUS);
      ring.stroke({ color: primaryColor, alpha: 0.18, width: 2 });
      this.container.addChild(ring);
    }

    const outer = new PIXI.Graphics();
    outer.circle(0, 0, 24);
    outer.fill({ color: outerColor, alpha: isSelf ? 0.22 : 0.14 });
    this.container.addChild(outer);

    this.body = new PIXI.Graphics();
    this.body.circle(0, 0, 20);
    this.body.fill({ color: primaryColor });
    this.container.addChild(this.body);

    const shine = new PIXI.Graphics();
    shine.circle(-6, -6, 6);
    shine.fill({ color: 0xffffff, alpha: 0.18 });
    this.container.addChild(shine);

    this.initialText = new PIXI.Text({
      text: name?.trim()?.charAt(0)?.toUpperCase() || "?",
      style: {
        fontSize: 16,
        fontWeight: "700",
        fill: 0xffffff,
        fontFamily: "sans-serif",
      },
    });
    this.initialText.anchor.set(0.5);
    this.container.addChild(this.initialText);

    this.nameTag = new PIXI.Container();
    this.nameTag.y = 30;

    this.labelBg = new PIXI.Graphics();
    this.nameTag.addChild(this.labelBg);

    this.label = new PIXI.Text({
      text: isSelf ? `${name} (You)` : name,
      style: {
        fontSize: 12,
        fontWeight: "600",
        fill: 0xffffff,
        fontFamily: "sans-serif",
      },
    });
    this.label.anchor.set(0.5, 0);
    this.label.y = 4;
    this.nameTag.addChild(this.label);

    this.drawLabelBackground();
    this.container.addChild(this.nameTag);
  }

  drawLabelBackground() {
    const paddingX = 10;
    const paddingY = 4;
    const width = this.label.width + paddingX * 2;
    const height = this.label.height + paddingY * 2;

    this.labelBg.clear();
    this.labelBg.roundRect(-width / 2, 0, width, height, 10);
    this.labelBg.fill({ color: 0x0f172a, alpha: 0.88 });
    this.labelBg.stroke({ color: 0xffffff, alpha: 0.08, width: 1 });
  }

  setPosition(x, y) {
    this.container.x = x;
    this.container.y = y;
    this.targetX = x;
    this.targetY = y;
  }

  setTargetPosition(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  updateSmooth(alpha = 0.15) {
    if (this.isSelf) return;
    this.container.x += (this.targetX - this.container.x) * alpha;
    this.container.y += (this.targetY - this.container.y) * alpha;
  }

  setMessage(text) {
    if (this.messageBubble) {
      this.messageBubble.destroy({ children: true });
      this.messageBubble = null;
    }

    if (!text) return;

    const bubble = new PIXI.Container();
    bubble.y = -85;

    const bubbleText = new PIXI.Text({
      text,
      style: {
        fontSize: 11,
        fill: 0xffffff,
        fontFamily: "sans-serif",
        wordWrap: true,
        wordWrapWidth: 140,
        align: "center",
      },
    });

    bubbleText.anchor.set(0.5, 0);

    const padding = 8;
    const width = bubbleText.width + padding * 2;
    const height = bubbleText.height + padding * 2;

    const bg = new PIXI.Graphics();
    bg.roundRect(-width / 2, 0, width, height, 10);
    bg.fill({ color: 0x111827, alpha: 0.95 });
    bg.stroke({ color: 0xffffff, alpha: 0.08, width: 1 });

    const tail = new PIXI.Graphics();
    tail.moveTo(-6, height);
    tail.lineTo(0, height + 8);
    tail.lineTo(6, height);
    tail.fill({ color: 0x111827, alpha: 0.95 });

    bubble.addChild(bg);
    bubbleText.y = padding;
    bubble.addChild(bubbleText);
    bubble.addChild(tail);

    this.container.addChild(bubble);
    this.messageBubble = bubble;

    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      if (this.messageBubble) {
        this.messageBubble.destroy({ children: true });
        this.messageBubble = null;
      }
    }, 3000);
  }

  destroy() {
    clearTimeout(this.messageTimeout);
    this.container.destroy({ children: true });
  }
}