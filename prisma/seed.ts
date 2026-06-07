import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const projectNames = [
    "Personal",
    "Work",
    "Study",
    "Health",
    "Finance",
    "Ideas",
    "Archive",
  ];

  for (const name of projectNames) {
    await prisma.project.upsert({
      where: { id: name.toLowerCase() },
      update: {},
      create: {
        id: name.toLowerCase(),
        name,
        icon: "folder",
      },
    });
  }

  console.log("✅ Seeded", projectNames.length, "projects");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());