import { prisma } from '../src/utils/prisma.js';

async function main() {
  const exercises = await prisma.exercise.createMany({
    data: [
      { name: 'Supino reto', muscleGroup: 'Peito', equipment: 'Barra', instructions: 'Deitado no banco, desça a barra controladamente.' },
      { name: 'Agachamento', muscleGroup: 'Pernas', equipment: 'Barra', instructions: 'Mantenha as costas eretas e desça até paralelo.' },
      { name: 'Levantamento terra', muscleGroup: 'Costas', equipment: 'Barra', instructions: 'Puxe a barra próxima ao corpo até a extensão completa.' },
      { name: 'Desenvolvimento militar', muscleGroup: 'Ombros', equipment: 'Halteres', instructions: 'Empurre os halteres acima da cabeça.' },
      { name: 'Rosca direta', muscleGroup: 'Bíceps', equipment: 'Barra', instructions: 'Flexione os cotovelos sem balançar o corpo.' },
      { name: 'Tríceps testa', muscleGroup: 'Tríceps', equipment: 'Halteres', instructions: 'Desça os halteres em direção à testa.' },
      { name: 'Puxada alta', muscleGroup: 'Costas', equipment: 'Máquina', instructions: 'Puxe a barra até a parte superior do peito.' },
      { name: 'Cadeira extensora', muscleGroup: 'Pernas', equipment: 'Máquina', instructions: 'Estenda os joelhos controladamente.' },
    ],
    skipDuplicates: true,
  });

  console.log(`Created ${exercises.count} exercises`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
