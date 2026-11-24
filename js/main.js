
const CONFIG = {
  width: 1280,
  height: 720,
  background: "#080d19",
  gravity: 1000
};

class ShadowKnight extends Phaser.Scene {
  constructor() {
    super("ShadowKnight");
  }

  create() {
    this.physics.world.setBounds(0, 0, 5000, 720);

    this.createWorld();
    this.createPlayer();
    this.createControls();
    this.createAtmosphere();
    this.createHUD();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, 5000, 720);
    this.cameras.main.setZoom(1);
  }

  createWorld() {
    const bg = this.add.graphics();

    bg.fillGradientStyle(
      0x101c34, 0x101c34,
      0x080b15, 0x080b15, 1
    );
    bg.fillRect(0, 0, 5000, 720);
    bg.setScrollFactor(0.15);

    // Montañas lejanas
    const mountains = this.add.graphics();
    mountains.fillStyle(0x17243a, 1);

    for (let x = 0; x < 5000; x += 260) {
      mountains.fillTriangle(
        x, 570,
        x + 130, 180 + Phaser.Math.Between(0, 100),
        x + 260, 570
      );
    }

    mountains.setScrollFactor(0.35);

    // Arcos y columnas antiguas
    for (let x = 300; x < 5000; x += 650) {
      this.add.rectangle(
        x, 460, 65, 350, 0x202c40
      );

      this.add.rectangle(
        x, 285, 155, 35, 0x34415a
      );

      this.add.rectangle(
        x + 100, 460, 45, 350, 0x18243a
      );
    }

    // Plataformas
    this.platforms = this.physics.add.staticGroup();

    for (let x = 0; x < 5000; x += 380) {
      const width = 380;

      const platform = this.add.rectangle(
        x + width / 2,
        650,
        width,
        140,
        0x26344b
      );

      platform.setStrokeStyle(3, 0x647b9a);

      this.physics.add.existing(platform, true);
      this.platforms.add(platform);

      this.add.rectangle(
        x + width / 2,
        581,
        width,
        3,
        0x8ca4c3
      );
    }

    // Pequeñas plataformas elevadas
    [850, 1550, 2250, 3100, 3900].forEach((x, i) => {
      const p = this.add.rectangle(
        x, 490 - (i % 2) * 75, 180, 28, 0x34435a
      );

      this.physics.add.existing(p, true);
      this.platforms.add(p);
    });
  }

  createPlayer() {
    this.player = this.add.container(120, 480);

    // Capa
    this.cape = this.add.graphics();
    this.cape.fillStyle(0x17243d, 1);
    this.cape.fillPoints([
      {x: 8, y: 24},
      {x: 39, y: 23},
      {x: 47, y: 74},
      {x: 4, y: 68}
    ], true);

    // Piernas
    this.legLeft = this.add.rectangle(
      15, 65, 10, 25, 0x78849a
    );

    this.legRight = this.add.rectangle(
      31, 65, 10, 25, 0x78849a
    );

    // Cuerpo
    const armor = this.add.graphics();
    armor.fillStyle(0x8998ad, 1);
    armor.fillRoundedRect(9, 23, 32, 42, 9);
    armor.fillStyle(0x35465f, 1);
    armor.fillRoundedRect(14, 30, 22, 29, 5);

    // Cabeza
    const head = this.add.graphics();

    head.fillStyle(0xdce6f2, 1);
    head.fillCircle(25, 15, 17);

    // Cuernos
    head.fillPoints([
      {x: 12, y: 10},
      {x: 1, y: -13},
      {x: 18, y: 5}
    ], true);

    head.fillPoints([
      {x: 38, y: 10},
      {x: 49, y: -13},
      {x: 32, y: 5}
    ], true);

    head.fillStyle(0x14213b, 1);
    head.fillEllipse(18, 16, 6, 4);
    head.fillEllipse(32, 16, 6, 4);

    this.sword = this.add.graphics();
    this.sword.lineStyle(5, 0xe0edff, 1);
    this.sword.lineBetween(38, 39, 72, 17);
    this.sword.lineStyle(5, 0xb5a17d, 1);
    this.sword.lineBetween(35, 36, 43, 43);
    this.sword.setVisible(false);

    this.player.add([
      this.cape,
      this.legLeft,
      this.legRight,
      armor,
      head,
      this.sword
    ]);

    this.physics.add.existing(this.player);

    this.player.body.setSize(38, 85);
    this.player.body.setOffset(5, 0);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setGravityY(CONFIG.gravity);

    this.physics.add.collider(
      this.player,
      this.platforms
    );

    this.player.body.setMaxVelocity(320, 900);
  }

  createControls() {
    this.keys = this.input.keyboard.addKeys({
      left: "A",
      right: "D",
      jump: "SPACE",
      attack: "J"
    });

    this.touch = {
      left: false,
      right: false
    };

    this.addTouchButton(90, 620, "◀", () => {
      this.touch.left = true;
    }, () => {
      this.touch.left = false;
    });

    this.addTouchButton(190, 620, "▶", () => {
      this.touch.right = true;
    }, () => {
      this.touch.right = false;
    });

    this.addTouchButton(1120, 620, "↑", () => {
      this.jump();
    });

    this.addTouchButton(1220, 620, "⚔", () => {
      this.attack();
    });
  }

  addTouchButton(x, y, label, down, up = () => {}) {
    const button = this.add.container(x, y)
      .setScrollFactor(0)
      .setDepth(100);

    const circle = this.add.circle(
      0, 0, 36, 0x1a2a43, 0.85
    );

    circle.setStrokeStyle(2, 0x8aa9d2);

    const text = this.add.text(
      0, 0, label,
      {
        fontSize: "27px",
        color: "#ffffff"
      }
    ).setOrigin(0.5);

    button.add([circle, text]);

    circle.setInteractive();

    circle.on("pointerdown", down);
    circle.on("pointerup", up);
    circle.on("pointerout", up);
  }

  jump() {
    if (this.player.body.blocked.down ||
        this.player.body.touching.down) {
      this.player.body.setVelocityY(-470);
    }
  }

  attack() {
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.sword.setVisible(true);

    this.tweens.add({
      targets: this.sword,
      angle: -75,
      duration: 130,
      yoyo: true,
      onComplete: () => {
        this.sword.setVisible(false);
        this.sword.angle = 0;
        this.isAttacking = false;
      }
    });
  }

  createAtmosphere() {
    this.particles = this.add.particles(
      0, 0, "spark", {
        x: {min: 0, max: 1280},
        y: {min: 0, max: 720},
        speedY: {min: -12, max: -35},
        speedX: {min: -8, max: 8},
        scale: {start: 0.6, end: 0},
        alpha: {start: 0.5, end: 0},
        lifespan: 5000,
        frequency: 120,
        quantity: 1,
        tint: 0x8fb9e8
      }
    ).setScrollFactor(0);

    // Luz ambiental
    const light = this.add.circle(
      640, 300, 120, 0x527dbb, 0.07
    ).setScrollFactor(0);

    this.tweens.add({
      targets: light,
      alpha: 0.15,
      scale: 1.2,
      duration: 2500,
      yoyo: true,
      repeat: -1
    });
  }

  createHUD() {
    this.add.text(
      25, 20, "SHADOW KNIGHT",
      {
        fontSize: "21px",
        fontStyle: "bold",
        color: "#dbeaff",
        letterSpacing: 3
      }
    ).setScrollFactor(0).setDepth(101);

    this.add.rectangle(
      95, 58, 140, 13, 0x26344b
    ).setScrollFactor(0).setDepth(101);

    this.healthBar = this.add.rectangle(
      95, 58, 140, 9, 0x63d6bd
    ).setScrollFactor(0).setDepth(102);
  }

  update() {
    const body = this.player.body;

    if (this.keys.left.isDown || this.touch.left) {
      body.setVelocityX(-230);
      this.player.setScale(-1, 1);
      this.sword.x = -42;
    } else if (this.keys.right.isDown || this.touch.right) {
      body.setVelocityX(230);
      this.player.setScale(1, 1);
      this.sword.x = 0;
    } else {
      body.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.jump)) {
      this.jump();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) {
      this.attack();
    }

    const moving = Math.abs(body.velocity.x) > 10;
    const grounded = body.blocked.down || body.touching.down;

    if (moving && grounded) {
      this.legLeft.rotation = Math.sin(this.time.now / 75) * 0.45;
      this.legRight.rotation = -Math.sin(this.time.now / 75) * 0.45;
      this.cape.rotation = Math.sin(this.time.now / 180) * 0.08;
    } else {
      this.legLeft.rotation = 0;
      this.legRight.rotation = 0;
    }

    if (!grounded) {
      this.legLeft.rotation = -0.25;
      this.legRight.rotation = 0.35;
    }

    if (moving && !this.isAttacking) {
      this.sword.setVisible(false);
    }

    this.player.y = Phaser.Math.Clamp(
      this.player.y, 0, 650
    );
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: CONFIG.width,
  height: CONFIG.height,
  backgroundColor: CONFIG.background,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {y: CONFIG.gravity},
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: ShadowKnight
});
  
