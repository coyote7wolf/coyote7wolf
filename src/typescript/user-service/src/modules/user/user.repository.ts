import { Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UserRepository {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  create(user: User): User {
    const newUser = { ...user, id: uuidv4() };
    this.users.push(newUser);
    return newUser;
  }

  update(id: string, user: User): User | undefined {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = { ...this.users[idx], ...user, id };
    return this.users[idx];
  }

  partialUpdate(id: string, data: Partial<User>): User | undefined {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = { ...this.users[idx], ...data, id };
    return this.users[idx];
  }

  remove(id: string): boolean {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }
}
