export class Device {
  id: string;
  userId: string;
  name: string;
  type?: string;
  status?: string;
  createdAt?: Date;

  constructor(init?: Partial<Device>) {
    this.id = init?.id ?? "";
    this.userId = init?.userId ?? "";
    this.name = init?.name ?? "";
    this.type = init?.type;
    this.status = init?.status ?? "active";
    this.createdAt = init?.createdAt ?? new Date();
  }
}
