
const STAGES = [
  {
    world: "Bosque olvidado",
    levels: 5,
    boss: "Guardián de raíces",
    color: 0x315b43,
    difficulty: 1
  },
  {
    world: "Minas oscuras",
    levels: 5,
    boss: "Coloso de piedra",
    color: 0x55566b,
    difficulty: 2
  },
  {
    world: "Reino sumergido",
    levels: 5,
    boss: "Leviatán",
    color: 0x236c85,
    difficulty: 3
  },
  {
    world: "Ciudad maldita",
    levels: 5,
    boss: "Caballero espectral",
    color: 0x67406f,
    difficulty: 4
  },
  {
    world: "Fortaleza infernal",
    levels: 5,
    boss: "Dragón abismal",
    color: 0x9b382d,
    difficulty: 5
  },
  {
    world: "Reino de las sombras",
    levels: 5,
    boss: "Rey de las sombras",
    color: 0x25213f,
    difficulty: 6
  }
];

function getStage(level) {
  if (level < 1 || level > 30) return null;

  const worldIndex = Math.floor((level - 1) / 5);
  const stage = STAGES[worldIndex];

  return {
    level,
    world: stage.world,
    boss: stage.boss,
    difficulty: stage.difficulty,
    color: stage.color
  };
}
