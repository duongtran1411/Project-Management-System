import Role from "../models/role.model";

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
