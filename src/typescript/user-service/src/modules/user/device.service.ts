import { Injectable, Optional } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeviceRepository } from "./device.repository";
import { Device } from "./device.entity";

@Injectable()
export class DeviceService {
  constructor(
    private readonly repo: DeviceRepository,
    @Optional() private readonly configService?: ConfigService
  ) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    userId?: string;
    type?: string;
    status?: string;
  }): any {
    // 範例：取得 config 設定值（若有注入 ConfigService）
    const deviceConfig = this.configService?.get<string>("DEVICE_CONFIG");
    let devices = this.repo?.findAll() || [];
    if (params?.userId)
      devices = devices.filter((d) => d.userId === params.userId);
    if (params?.type) devices = devices.filter((d) => d.type === params.type);
    if (params?.status)
      devices = devices.filter((d) => d.status === params.status);
    if (params?.sort) {
      const [field, order] = params.sort.split(":");
      devices = devices.sort((a, b) => {
        const av = a[field as keyof Device];
        const bv = b[field as keyof Device];
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
    const total = devices.length;
    const items = devices.slice((page - 1) * limit, page * limit);
    return { items, total, page, limit };
  }
  getById(id: string): Device | undefined {
    return this.repo?.findById(id);
  }
  getByUserId(userId: string): Device[] {
    return this.repo?.findByUserId(userId) || [];
  }
  create(userId: string, name: string, type?: string): Device {
    // 可加強型別驗證
    return this.repo?.create(userId, name, type);
  }
  update(id: string, name: string, type?: string): Device | undefined {
    return this.repo?.update(id, name, type);
  }
  delete(id: string): boolean {
    return this.repo?.delete(id) ?? false;
  }

  batchDelete(ids: string[]): Array<{ id: string; success: boolean }> {
    if (!Array.isArray(ids)) return [];
    return ids.map((id) => ({ id, success: this.repo?.delete(id) ?? false }));
  }

  partialUpdate(
    id: string,
    data: Partial<{ name?: string; type?: string }>
  ): Device | undefined {
    return this.repo?.partialUpdate(id, data);
  }

  batchPartialUpdate(
    items: Array<{
      id: string;
      data: Partial<{ name?: string; type?: string }>;
    }>
  ): Array<Device | undefined> {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      if (!item.id || !item.data) return undefined;
      return this.repo?.partialUpdate(item.id, item.data);
    });
  }
}
