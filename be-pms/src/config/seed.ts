import Role from "../models/role.model";

export async function seedAdminRole() {
  const adminRole = await Role.findOne({ name: "ADMIN" });
  if (!adminRole) {
    await Role.create({ name: "ADMIN", description: "Administrator role" });
    console.log("Seeded ADMIN role");
  } else {
    console.log("ADMIN role already exists");
  }
}
