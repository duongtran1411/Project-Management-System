import Role from "../models/role.model";
import User from "../models/user.model";

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
