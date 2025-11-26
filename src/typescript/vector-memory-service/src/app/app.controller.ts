import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { MemoryService } from "./services/memory.service";
import { EmbeddingDto, SearchDto, StoreDocumentDto } from "./dto/memory.dto";

@Controller()
export class AppController {
  constructor(private readonly memoryService: MemoryService) {}

  @Get("/health")
  async health() {
    return await this.memoryService.healthCheck();
  }

  @Post("/v1/memory/embedding")
  @UsePipes(new ValidationPipe({ transform: true }))
  async embedding(@Body() body: EmbeddingDto) {
    return await this.memoryService.generateEmbedding(body);
  }

  @Post("/v1/memory/search")
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(@Body() body: SearchDto) {
    return await this.memoryService.searchMemory(body);
  }

  @Post("/v1/memory/store")
  @UsePipes(new ValidationPipe({ transform: true }))
  async store(@Body() body: StoreDocumentDto) {
    return await this.memoryService.storeDocument(body);
  }

  @Get("/v1/memory/document/:id")
  async getDocument(@Param("id") id: string) {
    return await this.memoryService.getDocument(id);
  }

  @Delete("/v1/memory/document/:id")
  async deleteDocument(@Param("id") id: string) {
    return await this.memoryService.deleteDocument(id);
  }

  @Get("/v1/memory/stats")
  async getStats() {
    return await this.memoryService.getStats();
  }

  @Post("/v1/memory/test-pooling")
  async testPooling(@Body() body: { texts: string[] }) {
    if (!body.texts || !Array.isArray(body.texts)) {
      return { error: "texts array is required" };
    }
    return await this.memoryService.testPoolingStrategies(body.texts);
  }
}
