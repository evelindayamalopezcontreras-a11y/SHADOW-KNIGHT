
class WeaponShop {
  constructor(scene, inventory) {
    this.scene = scene;
    this.inventory = inventory;

    this.weapons = [
      {
        name: "Espada de hierro",
        damage: 1,
        price: 0,
        color: 0xb8c5d9
      },
      {
        name: "Espada de fuego",
        damage: 2,
        price: 100,
        color: 0xff713d
      },
      {
        name: "Espada de hielo",
        damage: 3,
        price: 250,
        color: 0x69dfff
      },
      {
        name: "Espada de sombras",
        damage: 5,
        price: 500,
        color: 0x9c72ff
      }
    ];

    this.currentWeapon = this.weapons[0];
    this.purchased = [this.weapons[0].name];
    this.panel = null;
  }

  buyWeapon(name) {
    const weapon = this.weapons.find(w => w.name === name);

    if (!weapon) return false;

    if (this.purchased.includes(name)) {
      this.currentWeapon = weapon;
      return true;
    }

    if (!this.inventory.spendCoins(weapon.price)) {
      return false;
    }

    this.purchased.push(name);
    this.currentWeapon = weapon;

    return true;
  }

  open() {
    if (this.panel) {
      this.panel.destroy();
    }

    this.panel = this.scene.add.container(640, 360)
      .setScrollFactor(0)
      .setDepth(400);

    const bg = this.scene.add.rectangle(
      0, 0, 650, 450, 0x111a2c, 0.98
    ).setStrokeStyle(3, 0x8c9dce);

    const title = this.scene.add.text(
      -290, -195, "TIENDA DE ARMAS", {
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold"
      }
    );

    this.panel.add([bg, title]);

    this.weapons.forEach((weapon, i) => {
      const y = -110 + i * 75;

      const label = this.scene.add.text(
        -275, y,
        `${weapon.name}  |  ${weapon.price} monedas`,
        {
          fontSize: "17px",
          color: "#dce5ff"
        }
      );

      const button = this.scene.add.text(
        210, y, 
        this.purchased.includes(weapon.name)
          ? "EQUIPAR"
          : "COMPRAR",
        {
          fontSize: "16px",
          color: "#75e5bd",
          backgroundColor: "#263956",
          padding: { x: 10, y: 7 }
        }
      ).setInteractive();

      button.on("pointerdown", () => {
        const success = this.buyWeapon(weapon.name);

        if (success) {
          button.setText("EQUIPADA");
        }
      });

      this.panel.add([label, button]);
    });

    const close = this.scene.add.text(
      280, -195, "✕", {
        fontSize: "25px",
        color: "#ff8295"
      }
    ).setInteractive();

    close.on("pointerdown", () => {
      this.panel.destroy();
      this.panel = null;
    });

    this.panel.add(close);
  }
}
