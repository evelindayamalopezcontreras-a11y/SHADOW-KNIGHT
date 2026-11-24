
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

const game = new Phaser.Game(config);

let player, platforms, cursors, keys;
let sword, enemies = [], particles;
let hp = 100, attacking = false, attackTime = 0;
let facing = 1, jumpReady = true;
let buttons = {};
let hud, healthBar, world;

function create() {
  const scene = this;
  world = scene;

  createTextures(scene);
  createBackground(scene);

  platforms = scene.physics.add.staticGroup();

  addPlatform(scene, 640, 690, 1800, 60);
  addPlatform(scene, 420, 535, 250, 30);
  addPlatform(scene, 820, 440, 250, 30);
  addPlatform(scene, 1180, 550, 250, 30);

  player = scene.physics.add.sprite(150, 550, "hero");
  player.setCollideWorldBounds(true);
  player.setBounce(0);
  player.setSize(34, 65);
  player.setOffset(15, 10);
  player.setDepth(10);

  scene.physics.add.collider(player, platforms);

  enemies = [];
  createEnemy(scene, 650, 600);
  createEnemy(scene, 1050, 600);

  cursors = scene.input.keyboard.createCursorKeys();
  keys = scene.input.keyboard.addKeys("A,D,W,SPACE,J");

  createControls(scene);
  createHUD(scene);
  createAtmosphere(scene);

  scene.cameras.main.setBounds(0, 0, 1800, 720);
  scene.cameras.main.startFollow(player, true, 0.08, 0.08);

  scene.physics.world.setBounds(0, 0, 1800, 720);
}

function createTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // Personaje
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

  // Plataforma
  g.fillStyle(0x242b3d);
  g.fillRect(0, 0, 100, 20);
  g.fillStyle(0x566078);
  g.fillRect(0, 0, 100, 4);
  g.generateTexture("platform", 100, 20);
  g.clear();

  // Enemigo
  g.fillStyle(0x39243e);
  g.fillRoundedRect(8, 10, 44, 45, 12);
  g.fillStyle(0xff526b);
  g.fillCircle(21, 28, 4);
  g.fillCircle(39, 28, 4);
  g.generateTexture("enemy", 60, 65);
  g.clear();

  // Partícula
  g.fillStyle(0x9dbaff);
  g.fillCircle(5, 5, 5);
  g.generateTexture("spark", 10, 10);
  g.destroy();
}

function createBackground(scene) {
  const bg = scene.add.graphics().setDepth(-20);

  bg.fillGradientStyle(0x111a32, 0x111a32, 0x080b14, 0x080b14, 1);
  bg.fillRect(0, 0, 1800, 720);

  // Luz de fondo
  bg.fillStyle(0x435c94, 0.12);
  bg.fillCircle(900, 200, 260);

  // Montañas lejanas
  bg.fillStyle(0x171d30);
  for (let x = 0; x < 1900; x += 180) {
    bg.fillTriangle(x, 520, x + 100, 180, x + 250, 520);
  }

  // Columnas
  for (let x = 80; x < 1800; x += 290) {
    bg.fillStyle(0x252b3d);
    bg.fillRect(x, 250, 45, 380);
    bg.fillStyle(0x414a61);
    bg.fillRect(x - 12, 245, 70, 15);
    bg.fillRect(x - 12, 620, 70, 18);
    bg.fillStyle(0x121827);
    bg.fillRect(x + 10, 260, 8, 360);
  }

  // Suelo
  bg.fillStyle(0x101522);
  bg.fillRect(0, 660, 1800, 60);
}

function addPlatform(scene, x, y, width, height) {
  const p = scene.add.tileSprite(x, y, width, height, "platform");
  scene.physics.add.existing(p, true);
  platforms.add(p);
}

function createEnemy(scene, x, y) {
  const enemy = scene.physics.add.sprite(x, y, "enemy");
  enemy.setCollideWorldBounds(true);
  enemy.setBounce(0);
  enemy.setSize(40, 50);
  enemy.hp = 3;
  enemy.direction = -1;
  scene.physics.add.collider(enemy, platforms);
  enemies.push(enemy);
}

function createControls(scene) {
  const makeButton = (x, y, symbol, name) => {
    const bg = scene.add.circle(x, y, 43, 0x26344f, 0.85)
      .setScrollFactor(0)
      .setStrokeStyle(3, 0x8799c7, 0.8)
      .setDepth(100);

    scene.add.text(x, y, symbol, {
      fontSize: "30px",
      color: "#ffffff"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    bg.setInteractive();

    bg.on("pointerdown", () => buttons[name] = true);
    bg.on("pointerup", () => buttons[name] = false);
    bg.on("pointerout", () => buttons[name] = false);
  };

  makeButton(90, 620, "◀", "left");
  makeButton(190, 620, "▶", "right");
  makeButton(1100, 620, "▲", "jump");
  makeButton(1200, 620, "⚔", "attack");
}

function createHUD(scene) {
  hud = scene.add.container(30, 25).setScrollFactor(0).setDepth(200);

  const title = scene.add.text(0, 0, "SHADOW KNIGHT", {
    fontSize: "24px",
    color: "#c7d5ff",
    fontStyle: "bold",
    letterSpacing: 3
  });

  const barBg = scene.add.rectangle(85, 48, 170, 14, 0x303448)
    .setOrigin(0, 0.5);

  healthBar = scene.add.rectangle(85, 48, 170, 14, 0x64dba0)
    .setOrigin(0, 0.5);

  const label = scene.add.text(0, 65, "BOSQUE OLVIDADO  •  NIVEL 1", {
    fontSize: "13px",
    color: "#aab5d0"
  });

  hud.add([title, barBg, healthBar, label]);
}

function createAtmosphere(scene) {
  particles = scene.add.particles(0, 0, "spark", {
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

  const left = cursors.left.isDown || keys.A.isDown || buttons.left;
  const right = cursors.right.isDown || keys.D.isDown || buttons.right;
  const jump = cursors.up.isDown || cursors.space.isDown ||
    keys.W.isDown || keys.SPACE.isDown || buttons.jump;

  const speed = 260;

  if (left) {
    player.setVelocityX(-speed);
    facing = -1;
  } else if (right) {
    player.setVelocityX(speed);
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
    }
  });

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

    world.time.delayedCall(120, () => {
      if (target.active) target.clearTint();
    });

    if (target.hp <= 0) {
      target.destroy();
    }
  }

  const slash = world.add.arc(
    player.x + facing * 45,
    player.y - 10,
    42,
    facing === 1 ? 200 : 20,
    facing === 1 ? 340 : 160,
    false,
    0x8deaff
  ).setStrokeStyle(6, 0x8deaff).setDepth(30);

  world.tweens.add({
    targets: slash,
    alpha: 0,
    scale: 1.5,
    duration: 220,
    onComplete: () => slash.destroy()
  });
}

function updateHealth() {
  healthBar.width = 170 * (hp / 100);
       }
             
