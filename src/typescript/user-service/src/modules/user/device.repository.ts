import { Device } from "./device.entity";
import { v4 as uuidv4 } from "uuid";

export class DeviceRepository {
  private devices: Device[] = [];

  findAll(): Device[] {
    return this.devices;
  }

  findById(id: string): Device | undefined {
    return this.devices.find((d) => d.id === id);
  }

  findByUserId(userId: string): Device[] {
    return this.devices.filter((d) => d.userId === userId);
  }

  create(userId: string, name: string, type?: string): Device {
    const device = new Device({ id: uuidv4(), userId, name, type });
    this.devices.push(device);
    return device;
  }

  update(id: string, name: string, type?: string): Device | undefined {
    const device = this.findById(id);
    if (device) {
      device.name = name;
      device.type = type;
    }
    return device;
  }

  partialUpdate(
    id: string,
    data: Partial<{ name?: string; type?: string }>
  ): Device | undefined {
    const device = this.findById(id);
    if (!device) return undefined;
    if (data.name !== undefined) device.name = data.name;
    if (data.type !== undefined) device.type = data.type;
    return device;
  }

  delete(id: string): boolean {
    const idx = this.devices.findIndex((d) => d.id === id);
    if (idx >= 0) {
      this.devices.splice(idx, 1);
      return true;
    }
    return false;
  }
}
