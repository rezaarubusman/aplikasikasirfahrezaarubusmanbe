import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const products = [
  ["Espresso", "Coffee", 18000, 50],
  ["Cappuccino", "Coffee", 28000, 35],
  ["Latte", "Coffee", 30000, 40],
  ["Americano", "Coffee", 22000, 60],
  ["Matcha Latte", "Tea", 32000, 25],
  ["Earl Grey", "Tea", 20000, 20],
  ["Croissant", "Bakery", 25000, 12],
  ["Chocolate Muffin", "Bakery", 22000, 8],
  ["Cheesecake", "Bakery", 38000, 6],
  ["Brownie", "Bakery", 24000, 0],
  ["Orange Juice", "Cold Drinks", 28000, 15],
  ["Lemonade", "Cold Drinks", 25000, 18],
  ["Iced Coffee", "Cold Drinks", 28000, 22],
  ["Smoothie Bowl", "Food", 55000, 5],
  ["Avocado Toast", "Food", 48000, 10],
  ["Caesar Salad", "Food", 52000, 7],
] as const;

async function main() {
  console.log("Seeding database...");

  // Admin default
  const hashedPassword = await argon2.hash(
    "admin123",
  );

  await prisma.user.create({
    data: {
      name: "Administrator",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Ambil semua category unik
  const categoryNames = [
    ...new Set(products.map((p) => p[1])),
  ];

  // Insert category
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({
        data: { name },
      })
    )
  );

  const categoryMap = new Map(
    categories.map((category) => [
      category.name,
      category.id,
    ])
  );

  // Insert products
  await prisma.product.createMany({
    data: products.map(
      ([name, category, price, stock]) => ({
        name,
        price,
        stock,
        categoryId:
          categoryMap.get(category),
      })
    ),
  });

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });