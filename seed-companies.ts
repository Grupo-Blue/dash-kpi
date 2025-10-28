import { drizzle } from "drizzle-orm/mysql2";
import { companies } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  await db.insert(companies).values([
    {
      name: "Blue Consult",
      slug: "blue-consult",
      description: "Consultoria em IR Cripto e serviços fiscais",
      active: true,
    },
    {
      name: "Tokeniza",
      slug: "tokeniza",
      description: "Plataforma de tokenização e ofertas públicas",
      active: true,
    },
    {
      name: "Tokeniza Private",
      slug: "tokeniza-private",
      description: "Grupo de investidores de elite",
      active: true,
    },
    {
      name: "BitClass (Tokeniza Academy)",
      slug: "bitclass",
      description: "Plataforma de educação e cursos",
      active: true,
    },
  ]);
  console.log("✅ Companies seeded successfully");
}

seed().catch(console.error);
