
class EnemySystem {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
  }

  create(x, y, type = "shadow") {
    const colors = {
      shadow: 0x39243e,
      skeleton: 0xb9b9a9,
      slime: 0x55bb91
    };

    const color = colors[type] || colors.shadow;

    const body = this.scene.add.ellipse(
      x, y, 48, 55, color
    ).setDepth(10);

    const eyes = this.scene.add.ellipse(
      x, y - 8, 22, 7, 0xff526b
    ).setDepth(11);

    const enemy = {
      body,
      eyes,
      hp: 3,
      speed: 55,
      direction: -1,
      alive: true,
      type
    };

    this.enemies.push(enemy);
    return enemy;
  }

  damage(enemy, amount = 1) {
    if (!enemy || !enemy.alive) return;

    enemy.hp -= amount;

    this.scene.tweens.add({
      targets: [enemy.body, enemy.eyes],
      alpha: 0.3,
      duration: 70,
      yoyo: true,
      repeat: 2
    });

    if (enemy.hp <= 0) {
      enemy.alive = false;

      this.scene.tweens.add({
        targets: [enemy.body, enemy.eyes],
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => {
          enemy.body.destroy();
          enemy.eyes.destroy();
        }
      });
    }
  }

  update(player) {
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;

      if (Math.abs(enemy.body.x - player.x) < 300) {
        enemy.direction = player.x > enemy.body.x ? 1 : -1;

        enemy.body.x += enemy.direction *
          enemy.speed * (1 / 60);

        enemy.eyes.x = enemy.body.x;
      }
    });
  }
}
