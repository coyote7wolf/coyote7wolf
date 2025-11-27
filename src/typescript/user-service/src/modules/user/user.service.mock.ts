import { Injectable } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserServiceMock extends UserService {
  constructor() {
    // Provide a fresh in-memory UserRepository instance to base class
    super(new UserRepository());
  }
  private users: any[] = [];
  private idCounter = 1;

  findAll({ page = 1, limit = 20, sort, role, status }: any = {}) {
    let items = [...this.users];
    if (role) items = items.filter((u) => u.role === role);
    if (status) items = items.filter((u) => u.status === status);
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      items: items.slice(start, end),
      total: items.length,
      page,
      limit,
    };
  }

  findOne(id: string) {
    return this.users.find((u) => u.id === id);
  }

  create(user: any) {
    const newUser = {
      ...user,
      id: String(this.idCounter++),
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  batchCreate(users: any[]) {
    return users.map((u) => this.create(u));
  }

  update(id: string, user: any) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = { ...this.users[idx], ...user };
    return this.users[idx];
  }

  batchUpdate(users: any[]) {
    return users.map((u) => this.update(u.id, u));
  }

  partialUpdate(id: string, data: any) {
    return this.update(id, data);
  }

  batchPartialUpdate(arr: { id: string; data: any }[]) {
    return arr.map(({ id, data }) => this.partialUpdate(id, data));
  }

  delete(id: string) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }

  batchDelete(ids: string[]) {
    return ids.map((id) => ({ id, success: this.delete(id) }));
  }
}
