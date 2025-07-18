import Role from "../models/role.model";
import User from "../models/user.model";
import ProjectRole from "../models/project.role.model";

export async function seedAdminRole() {
  const adminRole = await Role.findOne({ name: "ADMIN" });
  if (!adminRole) {
    await Role.create({
      name: "ADMIN",
      description: "Administrator System role",
    });
    console.log("Seeded ADMIN role");
  } else {
    console.log("ADMIN role already exists");
  }
}

export async function seedUserRole() {
  const userRole = await Role.findOne({ name: "USER" });
  if (!userRole) {
    await Role.create({
      name: "USER",
      description: "User role",
    });
    console.log("Seeded USER role");
  } else {
    console.log("USER role already exists");
  }
}

export async function seedProjectAdminRole() {
  const projectAdminRole = await ProjectRole.findOne({ name: "PROJECT_ADMIN" });
  if (!projectAdminRole) {
    await ProjectRole.create({
      name: "PROJECT_ADMIN",
    });
    console.log("Seeded PROJECT_ADMIN project role");
  } else {
    console.log("PROJECT_ADMIN project role already exists");
  }
}

export async function seedContributorRole() {
  const contributorRole = await ProjectRole.findOne({ name: "CONTRIBUTOR" });
  if (!contributorRole) {
    await ProjectRole.create({
      name: "CONTRIBUTOR",
    });
    console.log("Seeded CONTRIBUTOR project role");
  } else {
    console.log("CONTRIBUTOR project role already exists");
  }
}

export async function seedAdminUser() {
  try {
    const existingAdmin = await User.findOne({ email: "admin@pms.com" });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    const adminRole = await Role.findOne({ name: "ADMIN" });
    if (!adminRole) {
      console.log("ADMIN role not found, creating admin user failed");
      return;
    }

    await User.create({
      fullName: "System Administrator",
      email: "admin@pms.com",
      password: "admin123",
      status: "ACTIVE",
      verified: true,
      role: adminRole._id,
      failedLoginAttempts: 0,
    });

    console.log("✅ Admin user created successfully");
    console.log("📧 Email: admin@pms.com");
    console.log("🔑 Password: admin123");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
}

export async function seedAllRoles() {
  console.log("🌱 Starting role seeding...");
  await seedAdminRole();
  await seedUserRole();
  await seedProjectAdminRole();
  await seedContributorRole();
  console.log("✅ All roles seeded successfully!");
}
