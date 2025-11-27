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
import { RoleService } from "./role.service";

@Controller("roles")
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Get()
  getAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("sort") sort: string = "createdAt:desc",
    @Query("name") name?: string
  ) {
    const result = this.service.getAll({ page, limit, sort, name });
    return result.items;
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(
    @Body()
    body:
      | { name: string; description?: string }
      | Array<{ name: string; description?: string }>
  ) {
    const items = Array.isArray(body) ? body : [body];
    if (items.length > 100) {
      return { error: "Batch create limit is 100", status: "fail" };
    }
    const results = items.map((item) => {
      try {
        const created = this.service.create(item.name, item.description);
        return { ...created, status: "success" };
      } catch (e) {
        return { error: (e as Error).message, status: "fail" };
      }
    });
    return Array.isArray(body) ? results : results[0];
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() body: { name: string; description?: string }
  ) {
    return this.service.update(id, body.name, body.description);
  }

  @Put()
  batchUpdate(
    @Body() body: Array<{ id: string; name: string; description?: string }>
  ): any {
    if (!Array.isArray(body)) {
      return { error: "Batch update requires array body", status: "fail" };
    }
    if (body.length > 100) {
      return { error: "Batch update limit is 100", status: "fail" };
    }
    return body.map((item) => {
      if (!item.id) {
        return { error: "Missing id", status: "fail" };
      }
      try {
        const updated = this.service.update(
          item.id,
          item.name,
          item.description
        );
        if (updated) {
          return { ...updated, status: "success" };
        } else {
          return { error: "Role not found", id: item.id, status: "fail" };
        }
      } catch (e) {
        return { error: (e as Error).message, id: item.id, status: "fail" };
      }
    });
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    const result = this.service.delete(id);
    return { success: !!result };
  }

  @Delete()
  batchDelete(@Body() body: string[]): any {
    if (!Array.isArray(body)) {
      return { error: "Batch delete requires array body", status: "fail" };
    }
    if (body.length > 100) {
      return { error: "Batch delete limit is 100", status: "fail" };
    }
    return this.service.batchDelete(body).map(({ id, success }) => ({
      id,
      success,
      status: success ? "success" : "fail",
    }));
  }

  @Patch(":id")
  partialUpdate(
    @Param("id") id: string,
    @Body() body: Partial<{ name?: string; description?: string }>
  ): any {
    try {
      const updated = this.service.partialUpdate(id, body);
      if (updated) {
        return { ...updated, status: "success" };
      } else {
        return { error: "Role not found", id, status: "fail" };
      }
    } catch (e) {
      return { error: (e as Error).message, id, status: "fail" };
    }
  }

  @Patch()
  batchPartialUpdate(
    @Body()
    body: Array<{
      id: string;
      data: Partial<{ name?: string; description?: string }>;
    }>
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
        const updated = this.service.partialUpdate(item.id, item.data);
        if (updated) {
          return { ...updated, status: "success" };
        } else {
          return { error: "Role not found", id: item.id, status: "fail" };
        }
      } catch (e) {
        return { error: (e as Error).message, id: item.id, status: "fail" };
      }
    });
  }
}
