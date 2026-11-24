
class ChestSystem {
  constructor(scene) {
    this.scene = scene;
    this.coins = 0;
    this.opened = new Set();
    this.chests = [];
  }

  create(x, y) {
    const chest = this.scene.add.container(x, y);

    const base = this.scene.add.rectangle(
      0, 8, 62, 42, 0x684225
    ).setStrokeStyle(3, 0xe0a34e);

    const lid = this.scene.add.rectangle(
      0, -15, 66, 20, 0xa66b32
    ).setStrokeStyle(3, 0xf2c36c);

    const lock = this.scene.add.rectangle(
      0, 5, 10, 15, 0xffd66b
    );

    chest.add([base, lid, lock]);
    chest.setSize(75, 65);
    chest.setDepth(15);

    const item = {
      container: chest,
      lid,
      opened: false,
      hold: 0,
      x,
      y
    };

    chest.setInteractive(
      new Phaser.Geom.Rectangle(-38, -35, 76, 70),
      Phaser.Geom.Rectangle.Contains
    );

    chest.on("pointerdown", () => {
      item.hold = 0;
      item.pressing = true;
    });

    chest.on("pointerup", () => {
      item.pressing = false;
    });

    chest.on("pointerout", () => {
      item.pressing = false;
    });

    this.chests.push(item);
    return item;
  }

  update(delta) {
    for (const chest of this.chests) {
      if (chest.opened || !chest.pressing) continue;

      chest.hold += delta;

      if (chest.hold >= 3000) {
        this.open(chest);
      }
    }
  }

  open(chest) {
    chest.opened = true;
    chest.pressing = false;

    this.scene.tweens.add({
      targets: chest.lid,
      angle: -35,
      y: -28,
      duration: 300,
      ease: "Back.Out"
    });

    this.coins += 25;

    const reward = this.scene.add.text(
      chest.x, chest.y - 65, "+25 MONEDAS",
      {
        fontSize: "20px",
        color: "#ffd66b",
        fontStyle: "bold"
      }
    ).setOrigin(0.5).setDepth(100);

    this.scene.tweens.add({
      targets: reward,
      y: reward.y - 55,
      alpha: 0,
      duration: 1200,
      onComplete: () => reward.destroy()
    });
  }
        }
