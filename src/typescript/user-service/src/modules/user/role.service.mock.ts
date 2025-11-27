import { Injectable } from "@nestjs/common";
import { RoleService } from "./role.service";
import { RoleRepository } from "./role.repository";

@Injectable()
export class RoleServiceMock extends RoleService {
  constructor() {
    super(new RoleRepository());
  }
  private roles: any[] = [];
  private idCounter = 1;

  getAll({ page = 1, limit = 20, sort, name }: any = {}) {
    let items = [...this.roles];
    if (name) items = items.filter((r) => r.name === name);
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      items: items.slice(start, end),
      total: items.length,
      page,
      limit,
    };
  }

  getById(id: string) {
    return this.roles.find((r) => r.id === id);
  }

  create(name: string, description?: string) {
    const newRole = {
      id: String(this.idCounter++),
      name,
      description,
      createdAt: new Date(),
    };
    this.roles.push(newRole);
    return newRole;
  }

  batchCreate(arr: { name: string; description?: string }[]) {
    return arr.map((r) => this.create(r.name, r.description));
  }

  update(id: string, name: string, description?: string) {
    const idx = this.roles.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.roles[idx] = { ...this.roles[idx], name, description };
    return this.roles[idx];
  }

  batchUpdate(arr: { id: string; name: string; description?: string }[]) {
    return arr.map((r) => this.update(r.id, r.name, r.description));
  }

  partialUpdate(id: string, data: any) {
    return this.update(id, data.name, data.description);
  }

  batchPartialUpdate(arr: { id: string; data: any }[]) {
    return arr.map(({ id, data }) => this.partialUpdate(id, data));
  }

  delete(id: string) {
    const idx = this.roles.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.roles.splice(idx, 1);
    return true;
  }

  batchDelete(ids: string[]) {
    return ids.map((id) => ({ id, success: this.delete(id) }));
  }
}
