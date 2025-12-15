import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

async function createAdmin() {
  const args = process.argv.slice(2);

  // Parse arguments
  let name = "";
  let email = "";
  let password = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name" || args[i] === "-n") {
      name = args[i + 1] || "";
      i++;
    } else if (args[i] === "--email" || args[i] === "-e") {
      email = args[i + 1] || "";
      i++;
    } else if (args[i] === "--password" || args[i] === "-p") {
      password = args[i + 1] || "";
      i++;
    }
  }

  // Validate required fields
  if (!name || !email || !password) {
    console.error("\n❌ Error: Missing required arguments\n");
    console.log("Usage:");
    console.log(
      '  npm run create:admin -- --name "John Doe" --email "john@example.com" --password "secret123"\n'
    );
    console.log("Options:");
    console.log("  -n, --name      Full name of the admin user (required)");
    console.log("  -e, --email     Email address (required)");
    console.log("  -p, --password  Password (required)\n");
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("\n❌ Error: Invalid email format\n");
    process.exit(1);
  }

  // Validate password length
  if (password.length < 6) {
    console.error("\n❌ Error: Password must be at least 6 characters\n");
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(`\n❌ Error: User with email "${email}" already exists\n`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    console.log("\n✅ Admin user created successfully!\n");
    console.log(`   ID:    ${user.id}`);
    console.log(`   Name:  ${user.name}`);
    console.log(`   Email: ${user.email}\n`);
  } catch (error) {
    console.error("\n❌ Error creating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
