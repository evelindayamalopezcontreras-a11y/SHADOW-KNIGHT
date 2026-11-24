const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 1280,
  height: 720,
  backgroundColor: "#080b14",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1100 },
      debug: false
    }
  },
  scene: { create, update }
};

new Phaser.Game(config);

let player, platforms, cursors, keys;
let enemies = [];
let chestSystem, inventory, shop, bossSystem;
let healthBar, coinsText;
let hp = 100;
let facing = 1;
let attacking = false;
let attackTime = 0;
let jumpReady = true;
let buttons = {};
let uiOpen = false;

function create() {
  const scene = this;

  hp = 100;
  enemies = [];
  buttons = {};
  uiOpen = false;

  createTextures(scene);
  createBackground(scene);

  platforms = scene.physics.add.staticGroup();

  addPlatform(scene, 640, 690, 1800, 60);
  addPlatform(scene, 420, 535, 250, 30);
  addPlatform(scene, 820, 440, 250, 30);
  addPlatform(scene, 1180, 550, 250, 30);

  player = scene.physics.add.sprite(150, 550, "hero");
  player.setCollideWorldBounds(true);
  player.setSize(34, 65);
  player.setOffset(15, 10);
  player.setDepth(10);

  scene.physics.add.collider(player, platforms);

  createEnemy(scene, 650, 600);
  createEnemy(scene, 1050, 600);

  chestSystem = new ChestSystem(scene);
  chestSystem.create(420, 480);
  chestSystem.create(1180, 495);

  inventory = new InventorySystem(scene);
  shop = new WeaponShop(scene, inventory);

  bossSystem = new BossSystem(scene);

  cursors = scene.input.keyboard.createCursorKeys();
  keys = scene.input.keyboard.addKeys("A,D,W,SPACE,J,I,E");

  createControls(scene);
  createHUD(scene);
  createAtmosphere(scene);

  scene.cameras.main.setBounds(0, 0, 1800, 720);
  scene.cameras.main.startFollow(player, true, 0.08, 0.08);
  scene.physics.world.setBounds(0, 0, 1800, 720);

  scene.input.keyboard.on("keydown-I", () => {
    if (!uiOpen) {
      inventory.toggle();
      uiOpen = inventory.visible;
    }
  });

  scene.input.keyboard.on("keydown-E", () => {
    if (!uiOpen) {
      shop.open();
      uiOpen = true;
    }
  });
}

function createTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  g.fillStyle(0x161c32);
  g.fillRoundedRect(15, 15, 34, 60, 12);
  g.fillStyle(0x303c60);
  g.fillRoundedRect(19, 20, 26, 44, 9);
  g.fillStyle(0xe4eaff);
  g.fillCircle(32, 22, 15);
  g.fillStyle(0x090d19);
  g.fillCircle(32, 25, 12);
  g.fillStyle(0x70dfff);
  g.fillRect(23, 22, 7, 3);
  g.fillRect(34, 22, 7, 3);
  g.generateTexture("hero", 64, 90);
  g.clear();

  g.fillStyle(0x242b3d);
  g.fillRect(0, 0, 100, 20);
  g.fillStyle(0x566078);
  g.fillRect(0, 0, 100, 4);
  g.generateTexture("platform", 100, 20);
  g.clear();

  g.fillStyle(0x39243e);
  g.fillRoundedRect(8, 10, 44, 45, 12);
  g.fillStyle(0xff526b);
  g.fillCircle(21, 28, 4);
  g.fillCircle(39, 28, 4);
  g.generateTexture("enemy", 60, 65);
  g.clear();

  g.fillStyle(0x9dbaff);
  g.fillCircle(5, 5, 5);
  g.generateTexture("spark", 10, 10);

  g.destroy();
}

function createBackground(scene) {
  const bg = scene.add.graphics().setDepth(-20);

  bg.fillGradientStyle(
    0x111a32, 0x111a32,
    0x080b14, 0x080b14, 1
  );
  bg.fillRect(0, 0, 1800, 720);

  bg.fillStyle(0x435c94, 0.12);
  bg.fillCircle(900, 200, 260);

  bg.fillStyle(0x171d30);
  for (let x = 0; x < 1900; x += 180) {
    bg.fillTriangle(x, 520, x + 100, 180, x + 250, 520);
  }

  for (let x = 80; x < 1800; x += 290) {
    bg.fillStyle(0x252b3d);
    bg.fillRect(x, 250, 45, 380);
    bg.fillStyle(0x414a61);
    bg.fillRect(x - 12, 245, 70, 15);
    bg.fillRect(x - 12, 620, 70, 18);
    bg.fillStyle(0x121827);
    bg.fillRect(x + 10, 260, 8, 360);
  }

  bg.fillStyle(0x101522);
  bg.fillRect(0, 660, 1800, 60);
}

function addPlatform(scene, x, y, width, height) {
  const platform = platforms.create(x, y, "platform");
  platform.setDisplaySize(width, height);
  platform.refreshBody();
}

function createEnemy(scene, x, y) {
  const enemy = scene.physics.add.sprite(x, y, "enemy");

  enemy.setCollideWorldBounds(true);
  enemy.setSize(40, 50);
  enemy.hp = 3;
  enemy.direction = -1;
  enemy.lastHit = 0;

  scene.physics.add.collider(enemy, platforms);
  enemies.push(enemy);
}

function createControls(scene) {
  const makeButton = (x, y, symbol, name) => {
    const bg = scene.add.circle(
      x, y, 43, 0x26344f, 0.85
    )
      .setScrollFactor(0)
      .setStrokeStyle(3, 0x8799c7, 0.8)
      .setDepth(100);

    scene.add.text(x, y, symbol, {
      fontSize: "30px",
      color: "#ffffff"
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    bg.setInteractive();

    bg.on("pointerdown", () => buttons[name] = true);
    bg.on("pointerup", () => buttons[name] = false);
    bg.on("pointerout", () => buttons[name] = false);
  };

  makeButton(90, 620, "◀", "left");
  makeButton(190, 620, "▶", "right");
  makeButton(1100, 620, "▲", "jump");
  makeButton(1200, 620, "⚔", "attack");

  const bag = scene.add.text(1050, 30, "🎒", {
    fontSize: "30px",
    backgroundColor: "#26344f",
    padding: { x: 10, y: 8 }
  }).setScrollFactor(0).setDepth(150).setInteractive();

  bag.on("pointerdown", () => {
    if (shop.panel) closeShop();
    inventory.toggle();
    uiOpen = inventory.visible;
  });

  const store = scene.add.text(1150, 30, "⚒", {
    fontSize: "30px",
    backgroundColor: "#26344f",
    padding: { x: 10, y: 8 }
  }).setScrollFactor(0).setDepth(150).setInteractive();

  store.on("pointerdown", () => {
    if (inventory.visible) {
      inventory.toggle();
    }
    shop.open();
    uiOpen = true;
  });
}

function createHUD(scene) {
  const hud = scene.add.container(30, 25)
    .setScrollFactor(0)
    .setDepth(200);

  const title = scene.add.text(0, 0, "SHADOW KNIGHT", {
    fontSize: "24px",
    color: "#c7d5ff",
    fontStyle: "bold",
    letterSpacing: 3
  });

  const barBg = scene.add.rectangle(
    85, 48, 170, 14, 0x303448
  ).setOrigin(0, 0.5);

  healthBar = scene.add.rectangle(
    85, 48, 170, 14, 0x64dba0
  ).setOrigin(0, 0.5);

  const label = scene.add.text(
    0, 65, "BOSQUE OLVIDADO • NIVEL 1", {
      fontSize: "13px",
      color: "#aab5d0"
    }
  );

  coinsText = scene.add.text(0, 92, "🪙 0", {
    fontSize: "18px",
    color: "#ffd66b"
  });

  hud.add([title, barBg, healthBar, label, coinsText]);
}

function createAtmosphere(scene) {
  scene.add.particles(0, 0, "spark", {
    x: { min: 0, max: 1800 },
    y: { min: 100, max: 650 },
    lifespan: 7000,
    speedY: { min: -12, max: -35 },
    speedX: { min: -8, max: 8 },
    scale: { start: 0.7, end: 0 },
    alpha: { start: 0.5, end: 0 },
    frequency: 180,
    quantity: 1
  }).setDepth(5);
}

function update(time, delta) {
  if (!player || !player.body) return;

  if (uiOpen) {
    player.setVelocityX(0);
    return;
  }

  const left =
    cursors.left.isDown || keys.A.isDown || buttons.left;

  const right =
    cursors.right.isDown || keys.D.isDown || buttons.right;

  const jump =
    cursors.up.isDown ||
    cursors.space.isDown ||
    keys.W.isDown ||
    keys.SPACE.isDown ||
    buttons.jump;

  if (left) {
    player.setVelocityX(-260);
    facing = -1;
  } else if (right) {
    player.setVelocityX(260);
    facing = 1;
  } else {
    player.setVelocityX(0);
  }

  player.setFlipX(facing < 0);

  if (jump && player.body.blocked.down && jumpReady) {
    player.setVelocityY(-520);
    jumpReady = false;
  }

  if (!jump) jumpReady = true;

  if ((keys.J.isDown || buttons.attack) && !attacking) {
    attacking = true;
    attackTime = time;
    attackEnemy();
  }

  if (attacking && time - attackTime > 350) {
    attacking = false;
  }

  enemies.forEach(enemy => {
    if (!enemy.active) return;

    if (Math.abs(enemy.x - player.x) < 300) {
      enemy.setVelocityX(enemy.direction * 65);

      if (Math.abs(enemy.x - player.x) < 65) {
        enemy.direction = enemy.x > player.x ? 1 : -1;
      }
    } else {
      enemy.setVelocityX(0);
    }

    if (
      Math.abs(enemy.x - player.x) < 40 &&
      Math.abs(enemy.y - player.y) < 65 &&
      time - enemy.lastHit > 1200
    ) {
      enemy.lastHit = time;
      hp = Math.max(0, hp - 10);
      updateHealth();
    }
  });

  chestSystem.update(delta);

  inventory.addCoins(
    chestSystem.coins - (chestSystem.lastCoins || 0)
  );
  chestSystem.lastCoins = chestSystem.coins;

  coinsText.setText("🪙 " + inventory.coins);

  if (player.y > 850) {
    player.setPosition(150, 500);
    player.setVelocity(0, 0);
    hp = Math.max(0, hp - 10);
    updateHealth();
  }
}

function attackEnemy() {
  const target = enemies.find(enemy =>
    enemy.active &&
    Math.abs(enemy.x - player.x) < 115 &&
    Math.abs(enemy.y - player.y) < 100 &&
    (enemy.x - player.x) * facing > -10
  );

  if (target) {
    target.hp--;
    target.setTint(0xffffff);

    worldFlash(target);

    if (target.hp <= 0) {
      target.destroy();
      inventory.addCoins(10);
    }
  }

  const slash = thisArc();

  world.tweens.add({
    targets: slash,
    alpha: 0,
    scale: 1.5,
    duration: 220,
    onComplete: () => slash.destroy()
  });
}

function thisArc() {
  return world.add.arc(
    player.x + facing * 45,
    player.y - 10,
    42,
    facing === 1 ? 200 : 20,
    facing === 1 ? 340 : 160,
    false,
    0x8deaff
  ).setStrokeStyle(6, 0x8deaff).setDepth(30);
}

function worldFlash(target) {
  world.time.delayedCall(120, () => {
    if (target.active) target.clearTint();
  });
}

function updateHealth() {
  healthBar.width = 170 * (hp / 100);
}

function closeShop() {
  if (shop.panel) {
    shop.panel.destroy();
    shop.panel = null;
  }
  uiOpen = false;
    }
                
