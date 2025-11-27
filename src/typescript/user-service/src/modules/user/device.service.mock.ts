import { Injectable } from "@nestjs/common";
import { DeviceService } from "./device.service";
import { DeviceRepository } from "./device.repository";

@Injectable()
export class DeviceServiceMock extends DeviceService {
  constructor() {
    super(new DeviceRepository());
  }
  private devices: any[] = [];
  private idCounter = 1;

  getAll({ page = 1, limit = 20, sort, userId, type }: any = {}) {
    let items = [...this.devices];
    if (userId) items = items.filter((d) => d.userId === userId);
    if (type) items = items.filter((d) => d.type === type);
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
    return this.devices.find((d) => d.id === id);
  }

  getByUserId(userId: string) {
    return this.devices.filter((d) => d.userId === userId);
  }

  create(userId: string, name: string, type?: string) {
    const newDevice = {
      id: String(this.idCounter++),
      userId,
      name,
      type,
      createdAt: new Date(),
    };
    this.devices.push(newDevice);
    return newDevice;
  }

  batchCreate(arr: { userId: string; name: string; type?: string }[]) {
    return arr.map((d) => this.create(d.userId, d.name, d.type));
  }

  update(id: string, name: string, type?: string) {
    const idx = this.devices.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    this.devices[idx] = { ...this.devices[idx], name, type };
    return this.devices[idx];
  }

  batchUpdate(arr: { id: string; name: string; type?: string }[]) {
    return arr.map((d) => this.update(d.id, d.name, d.type));
  }

  partialUpdate(id: string, data: any) {
    return this.update(id, data.name, data.type);
  }

  batchPartialUpdate(arr: { id: string; data: any }[]) {
    return arr.map(({ id, data }) => this.partialUpdate(id, data));
  }

  delete(id: string) {
    const idx = this.devices.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.devices.splice(idx, 1);
    return true;
  }

  batchDelete(ids: string[]) {
    return ids.map((id) => ({ id, success: this.delete(id) }));
  }
}
