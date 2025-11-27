import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("sort") sort: string = "createdAt:desc",
    @Query("role") role?: string,
    @Query("status") status?: string
  ): any {
    const result = this.userService.findAll({
      page,
      limit,
      sort,
      role,
      status,
    });
    return result.items;
  }

  @Get(":id")
  findOne(@Param("id") id: string): User | undefined {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() body: User | User[]): any {
    const users = Array.isArray(body) ? body : [body];
    if (users.length > 100) {
      return { error: "Batch create limit is 100", status: "fail" };
    }
    const results = users.map((user) => {
      try {
        const created = this.userService.create(user);
        return { ...created, status: "success" };
      } catch (e) {
        return { error: (e as Error).message, status: "fail" };
      }
    });
    return Array.isArray(body) ? results : results[0];
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() user: User): User | undefined {
    return this.userService.update(id, user);
  }

  @Put()
  batchUpdate(@Body() body: User[]): any {
    if (!Array.isArray(body)) {
      return { error: "Batch update requires array body", status: "fail" };
    }
    if (body.length > 100) {
      return { error: "Batch update limit is 100", status: "fail" };
    }
    return body.map((user) => {
      if (!user.id) {
        return { error: "Missing id", status: "fail" };
      }
      try {
        const updated = this.userService.update(user.id, user);
        if (updated) {
          return { ...updated, status: "success" };
        } else {
          return { error: "User not found", id: user.id, status: "fail" };
        }
      } catch (e) {
        return { error: (e as Error).message, id: user.id, status: "fail" };
      }
    });
  }

  @Delete(":id")
  remove(@Param("id") id: string): { success: boolean } {
    return { success: this.userService.remove(id) };
  }

  @Delete()
  batchDelete(@Body() body: string[]): any {
    if (!Array.isArray(body)) {
      return { error: "Batch delete requires array body", status: "fail" };
    }
    if (body.length > 100) {
      return { error: "Batch delete limit is 100", status: "fail" };
    }
    const results = this.userService.batchRemove(body);
    return results.map((r) => ({
      id: r.id,
      success: r.success === undefined ? false : r.success,
      status: r.success ? "success" : "fail",
    }));
  }

  @Patch(":id")
  partialUpdate(@Param("id") id: string, @Body() body: Partial<User>): any {
    try {
      const updated = this.userService.partialUpdate(id, body);
      if (updated) {
        return { ...updated, status: "success" };
      } else {
        return { error: "User not found", id, status: "fail" };
      }
    } catch (e) {
      return { error: (e as Error).message, id, status: "fail" };
    }
  }

  @Patch()
  batchPartialUpdate(
    @Body() body: Array<{ id: string; data: Partial<User> }>
  ): any {
    if (!Array.isArray(body)) {
      return { error: "Batch patch requires array body", status: "fail" };
    }
    if (body.length > 100) {
      return { error: "Batch patch limit is 100", status: "fail" };
    }
    return body.map((item) => {
      if (!item.id || !item.data) {
        return { error: "Missing id or data", status: "fail" };
      }
      try {
        const updated = this.userService.partialUpdate(item.id, item.data);
        if (updated) {
          return { ...updated, status: "success" };
        } else {
          return { error: "User not found", id: item.id, status: "fail" };
        }
      } catch (e) {
        return { error: (e as Error).message, id: item.id, status: "fail" };
      }
    });
  }
}
