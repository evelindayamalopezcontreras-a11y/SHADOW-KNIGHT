let player;
let platforms;
let enemies = [];
let cursors;
let keys;
let world;

let inventory;
let shop;
let chestSystem;

let health = 100;
let healthBar;
let coinText;
let levelText;

let controls = {
  left: false,
  right: false,
  jump: false
};

let attackReady = true;
let totalCoins = 0;

class ShadowKnightScene extends Phaser.Scene {
  constructor() {
    super("ShadowKnight");
  }

  create() {
    const scene = this;
    world = scene;

    this.physics.world.setBounds(0, 0, 2400, 720);

    this.createTextures();
    this.createBackground();
    this.createPlatforms();
    this.createPlayer();
    this.createEnemies();
    this.createSystems();
    this.createControls();
    this.createHUD();

    this.cameras.main.setBounds(0, 0, 2400, 720);
    this.cameras.main.startFollow(player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys("A,D,W,SPACE,J,I,E");

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.overlap(
      player,
      enemies,
      this.playerHit,
      null,
      this
    );
  }

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x252d49);
    g.fillRoundedRect(5, 5, 42, 62, 12);
    g.fillStyle(0xdce7ff);
    g.fillCircle(17, 22, 5);
    g.fillCircle(35, 22, 5);
    g.fillStyle(0x8c9cff);
    g.fillRect(12, 48, 28, 7);
    g.generateTexture("knight", 52, 72);
    g.clear();

    g.fillStyle(0x9b354f);
    g.fillRoundedRect(4, 8, 42, 40, 10);
    g.fillStyle(0xffd5e0);
    g.fillCircle(16, 22, 4);
    g.fillCircle(34, 22, 4);
    g.generateTexture("enemy", 52, 55);
    g.clear();

    g.fillStyle(0x657da8);
    g.fillRoundedRect(0, 0, 150, 30, 8);
    g.generateTexture("platform", 150, 30);
    g.destroy();
  }

  createBackground() {
    this.add.rectangle(1200, 360, 2400, 720, 0x090d1b);

    for (let i = 0; i < 20; i++) {
      const x = i * 130;

      this.add.circle(
        x,
        100 + Math.random() * 300,
        2 + Math.random() * 3,
        0x8998d8,
        0.6
      );

      this.add.rectangle(
        x,
        550,
        90,
        340 + Math.random() * 150,
        0x121b32
      ).setDepth(-2);
    }

    for (let i = 0; i < 8; i++) {
      this.add.rectangle(
        i * 350,
        680,
        320,
        80,
        0x11182a
      ).setDepth(-1);
    }
  }

  createPlatforms() {
    platforms = this.physics.add.staticGroup();

    const positions = [
      [200, 650, 500],
      [750, 650, 400],
      [1250, 650, 500],
      [1850, 650, 700],
      [500, 490, 180],
      [950, 410, 180],
      [1400, 500, 200],
      [1750, 390, 200],
      [2150, 490, 180]
    ];

    positions.forEach(([x, y, width]) => {
      const platform = this.add.rectangle(
        x,
        y,
        width,
        30,
        0x303d61
      ).setStrokeStyle(2, 0x8296d4);

      this.physics.add.existing(platform, true);
      platforms.add(platform);
    });
  }

  createPlayer() {
    player = this.physics.add.sprite(100, 500, "knight");

    player.setCollideWorldBounds(true);
    player.setBounce(0.05);
    player.setMaxVelocity(300, 800);
    player.body.setSize(38, 65);
  }

  createEnemies() {
    enemies = [];

    [600, 1100, 1600, 2050].forEach((x, index) => {
      const enemy = this.physics.add.sprite(
        x,
        500,
        "enemy"
      );

      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      enemy.health = 2 + index;
      enemy.direction = index % 2 === 0 ? 1 : -1;
      enemy.startX = x;

      enemies.push(enemy);
    });
  }

  createSystems() {
    inventory = new InventorySystem(this);
    shop = new WeaponShop(this, inventory);
    chestSystem = new ChestSystem(this);

    chestSystem.create(350, 580);
    chestSystem.create(1450, 430);
    chestSystem.create(2200, 420);
  }

  createControls() {
    this.createTouchButton(75, 620, "◀", () => {
      controls.left = true;
    }, () => {
      controls.left = false;
    });

    this.createTouchButton(180, 620, "▶", () => {
      controls.right = true;
    }, () => {
      controls.right = false;
    });

    this.createTouchButton(1130, 620, "▲", () => {
      controls.jump = true;
    }, () => {
      controls.jump = false;
    });

    this.createTouchButton(1030, 520, "⚔", () => {
      this.attack();
    });

    this.createTouchButton(1170, 80, "🎒", () => {
      this.toggleInventory();
    });

    this.createTouchButton(1050, 80, "🛒", () => {
      this.openShop();
    });
  }

  createTouchButton(x, y, label, down, up) {
    const button = this.add.text(x, y, label, {
      fontSize: "32px",
      color: "#ffffff",
      backgroundColor: "#26344f",
      padding: { x: 17, y: 12 }
    });

    button.setOrigin(0.5);
    button.setScrollFactor(0);
    button.setDepth(250);
    button.setAlpha(0.85);
    button.setInteractive();

    button.on("pointerdown", () => {
      if (down) down();
    });

    button.on("pointerup", () => {
      if (up) up();
    });

    button.on("pointerout", () => {
      if (up) up();
    });
  }

  createHUD() {
    this.add.text(25, 20, "SHADOW KNIGHT", {
      fontSize: "24px",
      color: "#c7d5ff",
      fontStyle: "bold"
    }).setScrollFactor(0).setDepth(200);

    this.add.rectangle(
      110,
      75,
      170,
      14,
      0x303448
    ).setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(200);

    healthBar = this.add.rectangle(
      110,
      75,
      170,
      14,
      0x64dba0
    ).setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(201);

    coinText = this.add.text(25, 100, "🪙 0", {
      fontSize: "20px",
      color: "#ffd66b"
    }).setScrollFactor(0).setDepth(200);

    levelText = this.add.text(25, 130, "NIVEL 1", {
      fontSize: "17px",
      color: "#ffffff"
    }).setScrollFactor(0).setDepth(200);
  }

  update(time, delta) {
    if (!player || !player.active) return;

    if (inventory.visible || shop.panel) {
      player.setVelocityX(0);
      return;
    }

    const left = controls.left || cursors.left.isDown || keys.A.isDown;
    const right = controls.right || cursors.right.isDown || keys.D.isDown;
    const jump = controls.jump || cursors.up.isDown ||
      keys.W.isDown || keys.SPACE.isDown;

    if (left) {
      player.setVelocityX(-230);
      player.setFlipX(true);
    } else if (right) {
      player.setVelocityX(230);
      player.setFlipX(false);
    } else {
      player.setVelocityX(0);
    }

    if (jump && player.body.blocked.down) {
      player.setVelocityY(-470);
    }

    if (Phaser.Input.Keyboard.JustDown(keys.J)) {
      this.attack();
    }

    if (Phaser.Input.Keyboard.JustDown(keys.I)) {
      this.toggleInventory();
    }

    if (Phaser.Input.Keyboard.JustDown(keys.E)) {
      this.openShop();
    }

    chestSystem.update(delta);

    if (chestSystem.coins > totalCoins) {
      const earned = chestSystem.coins - totalCoins;
      inventory.addCoins(earned);
      totalCoins = chestSystem.coins;
    }

    coinText.setText("🪙 " + inventory.coins);

    enemies.forEach(enemy => {
      if (!enemy.active) return;

      if (Math.abs(enemy.x - enemy.startX) > 100) {
        enemy.direction *= -1;
      }

      enemy.setVelocityX(enemy.direction * 45);
      enemy.setFlipX(enemy.direction < 0);
    });
  }

  attack() {
    if (!attackReady || inventory.visible || shop.panel) return;

    attackReady = false;

    const direction = player.flipX ? -1 : 1;

    const sword = this.add.rectangle(
      player.x + direction * 45,
      player.y,
      65,
      10,
      0x9deaff
    );

    sword.setRotation(direction * -0.3);
    sword.setDepth(100);

    this.tweens.add({
      targets: sword,
      alpha: 0,
      duration: 180,
      onComplete: () => sword.destroy()
    });

    enemies.forEach(enemy => {
      if (!enemy.active) return;

      const closeX = Math.abs(enemy.x - player.x) < 90;
      const closeY = Math.abs(enemy.y - player.y) < 65;
      const inFront = direction > 0
        ? enemy.x > player.x
        : enemy.x < player.x;

      if (closeX && closeY && inFront) {
        enemy.health--;

        this.tweens.add({
          targets: enemy,
          alpha: 0.3,
          yoyo: true,
          duration: 80,
          repeat: 1
        });

        if (enemy.health <= 0) {
          enemy.destroy();
          inventory.addCoins(10);
        }
      }
    });

    this.time.delayedCall(350, () => {
      attackReady = true;
    });
  }

  playerHit(playerObject, enemy) {
    if (playerObject.invulnerable || !enemy.active) return;

    health -= 10;
    health = Math.max(0, health);

    healthBar.width = 170 * (health / 100);

    playerObject.invulnerable = true;
    playerObject.setTint(0xff7777);

    this.time.delayedCall(900, () => {
      if (playerObject.active) {
        playerObject.invulnerable = false;
        playerObject.clearTint();
      }
    });

    if (health <= 0) {
      this.physics.pause();

      this.add.text(
        this.cameras.main.scrollX + 640,
        350,
        "HAS CAÍDO\nToca para reiniciar",
        {
          fontSize: "38px",
          color: "#ff8295",
          align: "center",
          backgroundColor: "#10182a",
          padding: { x: 25, y: 20 }
        }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(500)
        .setInteractive()
        .on("pointerdown", () => {
          health = 100;
          totalCoins = 0;
          this.scene.restart();
        });
    }
  }

  toggleInventory() {
    if (shop.panel) {
      shop.panel.destroy();
      shop.panel = null;
    }

    inventory.toggle();
  }

  openShop() {
    if (inventory.visible) {
      inventory.toggle();
    }

    shop.open();
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 1280,
  height: 720,
  backgroundColor: "#090d1b",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: ShadowKnightScene
};

new Phaser.Game(config);
        
