
class BossSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentBoss = null;
  }

  create(name, x, y, health = 100) {
    if (this.currentBoss) {
      this.currentBoss.body.destroy();
      this.currentBoss.eye.destroy();
    }

    const body = this.scene.add.rectangle(
      x, y, 130, 170, 0x30223e
    ).setStrokeStyle(5, 0x9271bb).setDepth(20);

    const eye = this.scene.add.ellipse(
      x, y - 35, 55, 12, 0xff435f
    ).setDepth(21);

    this.currentBoss = {
      name,
      body,
      eye,
      health,
      maxHealth: health,
      alive: true,
      direction: -1
    };

    this.showBossBar();
    return this.currentBoss;
  }

  showBossBar() {
    const boss = this.currentBoss;

    this.bar = this.scene.add.container(640, 90)
      .setScrollFactor(0)
      .setDepth(500);

    const title = this.scene.add.text(
      -180, -35, boss.name.toUpperCase(), {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold"
      }
    );

    const bg = this.scene.add.rectangle(
      0, 0, 370, 18, 0x35313e
    );

    this.healthBar = this.scene.add.rectangle(
      -185, 0, 370, 18, 0xd94c68
    ).setOrigin(0, 0.5);

    this.bar.add([title, bg, this.healthBar]);
  }

  damage(amount = 10) {
    const boss = this.currentBoss;

    if (!boss || !boss.alive) return;

    boss.health = Math.max(0, boss.health - amount);

    this.healthBar.width =
      370 * (boss.health / boss.maxHealth);

    this.scene.tweens.add({
      targets: boss.body,
      alpha: 0.4,
      duration: 80,
      yoyo: true
    });

    if (boss.health <= 0) {
      boss.alive = false;

      this.scene.tweens.add({
        targets: [boss.body, boss.eye],
        alpha: 0,
        scale: 0,
        duration: 900
      });
    }
  }

  update(player) {
    const boss = this.currentBoss;

    if (!boss || !boss.alive) return;

    boss.direction = player.x > boss.body.x ? 1 : -1;

    boss.body.x += boss.direction * 0.5;
    boss.eye.x = boss.body.x;
  }
}
