export class User {
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: string; // active/inactive
  createdAt?: Date;
  deviceInfo?: string;

  constructor(init?: Partial<User>) {
    this.id = init?.id ?? "";
    this.name = init?.name ?? "";
    this.email = init?.email ?? "";
    this.role = init?.role ?? "";
    this.status = init?.status ?? "active";
    this.createdAt = init?.createdAt ?? new Date();
    this.deviceInfo = init?.deviceInfo;
  }
}
