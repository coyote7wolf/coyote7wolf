import { Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findAll(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    role?: string;
    status?: string;
  }): any {
    let users = this.userRepository.findAll();
    if (params?.role) users = users.filter((u) => u.role === params.role);
    if (params?.status) users = users.filter((u) => u.status === params.status);
    if (params?.sort) {
      const [field, order] = params.sort.split(":");
      users = users.sort((a, b) => {
        const av = a[field as keyof User];
        const bv = b[field as keyof User];
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
    const total = users.length;
    const items = users.slice((page - 1) * limit, page * limit);
    return { items, total, page, limit };
  }

  // 已在 class 內部定義，移除重複方法
  findOne(id: string): User | undefined {
    return this.userRepository.findOne(id);
  }

  create(user: User): User {
    // 可加強型別驗證
    return this.userRepository.create(user);
  }

  update(id: string, user: User): User | undefined {
    return this.userRepository.update(id, user);
  }

  remove(id: string): boolean {
    return this.userRepository.remove(id);
  }

  batchRemove(ids: string[]): Array<{ id: string; success: boolean }> {
    if (!Array.isArray(ids)) return [];
    return ids.map((id) => ({ id, success: this.userRepository.remove(id) }));
  }

  partialUpdate(id: string, data: Partial<User>): User | undefined {
    return this.userRepository.partialUpdate(id, data);
  }

  batchPartialUpdate(
    items: Array<{ id: string; data: Partial<User> }>
  ): Array<User | undefined> {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      if (!item.id || !item.data) return undefined;
      return this.userRepository.partialUpdate(item.id, item.data);
    });
  }
}
