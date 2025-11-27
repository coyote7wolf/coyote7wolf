import { Role } from "./role.entity";
import { v4 as uuidv4 } from "uuid";

export class RoleRepository {
  private roles: Role[] = [];

  findAll(): Role[] {
    return this.roles;
  }

  findById(id: string): Role | undefined {
    return this.roles.find((r) => r.id === id);
  }

  create(name: string, description?: string): Role {
    const role = new Role({ id: uuidv4(), name, description });
    this.roles.push(role);
    return role;
  }

  update(id: string, name: string, description?: string): Role | undefined {
    const role = this.findById(id);
    if (role) {
      role.name = name;
      role.description = description;
    }
    return role;
  }

  partialUpdate(
    id: string,
    data: Partial<{ name?: string; description?: string }>
  ): Role | undefined {
    const role = this.findById(id);
    if (!role) return undefined;
    if (data.name !== undefined) role.name = data.name;
    if (data.description !== undefined) role.description = data.description;
    return role;
  }

  delete(id: string): boolean {
    const idx = this.roles.findIndex((r) => r.id === id);
    if (idx >= 0) {
      this.roles.splice(idx, 1);
      return true;
    }
    return false;
  }
}
