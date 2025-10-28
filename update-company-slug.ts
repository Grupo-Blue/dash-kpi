import { drizzle } from "drizzle-orm/mysql2";
import { companies } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function update() {
  await db.update(companies)
    .set({ 
      name: "Tokeniza Academy",
      slug: "tokeniza-academy",
      description: "Plataforma de educação e cursos"
    })
    .where(eq(companies.slug, "bitclass"));
  
  console.log("✅ Company updated successfully");
}

update().catch(console.error);
