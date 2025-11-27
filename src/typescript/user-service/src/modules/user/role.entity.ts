export class Role {
  id: string;
  name: string;
  description?: string;
  status?: string;
  createdAt?: Date;

  constructor(init?: Partial<Role>) {
    this.id = init?.id ?? "";
    this.name = init?.name ?? "";
    this.description = init?.description;
    this.status = init?.status ?? "active";
    this.createdAt = init?.createdAt ?? new Date();
  }
}
