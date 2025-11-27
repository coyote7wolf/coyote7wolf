import { Injectable } from "@nestjs/common";
import { RoleRepository } from "./role.repository";
import { Role } from "./role.entity";

@Injectable()
export class RoleService {
  constructor(private readonly repo: RoleRepository) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    name?: string;
    status?: string;
  }): any {
    let roles = this.repo.findAll();
    if (params?.name)
      roles = roles.filter((r) => r.name?.includes(params.name ?? "") ?? false);
    if (params?.status) roles = roles.filter((r) => r.status === params.status);
    if (params?.sort) {
      const [field, order] = params.sort.split(":");
      roles = roles.sort((a, b) => {
        const av = a[field as keyof Role];
        const bv = b[field as keyof Role];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av < bv) return order === "desc" ? 1 : -1;
        if (av > bv) return order === "desc" ? -1 : 1;
        return 0;
      });
    }
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const total = roles.length;
    const items = roles.slice((page - 1) * limit, page * limit);
    return { items, total, page, limit };
  }
  getById(id: string): Role | undefined {
    return this.repo.findById(id);
  }
  create(name: string, description?: string): Role {
    // 可加強型別驗證
    return this.repo.create(name, description);
  }
  update(id: string, name: string, description?: string): Role | undefined {
    return this.repo.update(id, name, description);
  }
  delete(id: string): boolean {
    return this.repo.delete(id);
  }

  batchDelete(ids: string[]): Array<{ id: string; success: boolean }> {
    if (!Array.isArray(ids)) return [];
    return ids.map((id) => ({ id, success: this.repo.delete(id) }));
  }

  partialUpdate(
    id: string,
    data: Partial<{ name?: string; description?: string }>
  ): Role | undefined {
    return this.repo.partialUpdate(id, data);
  }

  batchPartialUpdate(
    items: Array<{
      id: string;
      data: Partial<{ name?: string; description?: string }>;
    }>
  ): Array<Role | undefined> {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      if (!item.id || !item.data) return undefined;
      return this.repo.partialUpdate(item.id, item.data);
    });
  }
}
