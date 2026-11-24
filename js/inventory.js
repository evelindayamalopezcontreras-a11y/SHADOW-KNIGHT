
class InventorySystem {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.maxSlots = 12;
    this.visible = false;
    this.coins = 0;
  }

  addItem(name, type, quantity = 1) {
    const existing = this.items.find(item => item.name === name);

    if (existing) {
      existing.quantity += quantity;
      return true;
    }

    if (this.items.length >= this.maxSlots) {
      return false;
    }

    this.items.push({ name, type, quantity });
    return true;
  }

  removeItem(name, quantity = 1) {
    const item = this.items.find(item => item.name === name);

    if (!item || item.quantity < quantity) return false;

    item.quantity -= quantity;

    if (item.quantity <= 0) {
      this.items = this.items.filter(i => i !== item);
    }

    return true;
  }

  addCoins(amount) {
    this.coins += amount;
  }

  spendCoins(amount) {
    if (this.coins < amount) return false;

    this.coins -= amount;
    return true;
  }

  toggle() {
    this.visible = !this.visible;

    if (this.panel) {
      this.panel.destroy();
      this.panel = null;
    }

    if (this.visible) {
      this.draw();
    }
  }

  draw() {
    const scene = this.scene;

    this.panel = scene.add.container(640, 360)
      .setScrollFactor(0)
      .setDepth(300);

    const background = scene.add.rectangle(
      0, 0, 560, 420, 0x10182a, 0.97
    ).setStrokeStyle(3, 0x8097c7);

    const title = scene.add.text(
      -240, -185, "MOCHILA", {
        fontSize: "30px",
        color: "#d5e2ff",
        fontStyle: "bold"
      }
    );

    this.panel.add([background, title]);

    for (let i = 0; i < this.maxSlots; i++) {
      const x = -195 + (i % 4) * 130;
      const y = -85 + Math.floor(i / 4) * 95;

      const slot = scene.add.rectangle(
        x, y, 105, 75, 0x202c45
      ).setStrokeStyle(2, 0x60769d);

      this.panel.add(slot);

      const item = this.items[i];

      if (item) {
        const label = scene.add.text(
          x, y - 10,
          item.name + "\nx" + item.quantity,
          {
            fontSize: "14px",
            color: "#ffffff",
            align: "center"
          }
        ).setOrigin(0.5);

        this.panel.add(label);
      }
    }

    const close = scene.add.text(
      225, -180, "✕", {
        fontSize: "28px",
        color: "#ff8295"
      }
    ).setInteractive();

    close.on("pointerdown", () => this.toggle());

    this.panel.add(close);
  }
}
