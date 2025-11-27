import { Role } from "../role.entity";
export const mockRoles: Role[] = [
  new Role({ id: "1", name: "admin", description: "Administrator" }),
  new Role({ id: "2", name: "user", description: "Regular user" }),
];
