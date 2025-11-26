import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UsePipes,
  ValidationPipe,
  Param,
} from "@nestjs/common";
import { Response } from "express";

import { AppService } from "./service/app.service";
import {
  ChatCompletionDto,
  CompletionDto,
  EmbeddingDto,
  LoRATrainDto,
  FineTuneDto,
} from "./dto/llm.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get("/health")
  health() {
    return this.appService.health();
  }

  @Post("/v1/chat/completions")
  @UsePipes(new ValidationPipe({ transform: true }))
  async chatCompletions(@Body() body: ChatCompletionDto, @Res() res: Response) {
    if (body.stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Mock streaming response
      const response = await this.appService.chatCompletions(body);
      const content = response.choices[0]?.message?.content || "";

      res.write(
        `data: {"choices":[{"delta":{"content":"${content.slice(
          0,
          content.length / 2
        )}"}}]}` + "\n\n"
      );
      setTimeout(() => {
        res.write(
          `data: {"choices":[{"delta":{"content":"${content.slice(
            content.length / 2
          )}"}}]}` + "\n\n"
        );
        res.write("data: [DONE]" + "\n\n");
        res.end();
      }, 500);
    } else {
      const response = await this.appService.chatCompletions(body);
      res.json(response);
    }
  }

  @Post("/v1/completions")
  @UsePipes(new ValidationPipe({ transform: true }))
  async completions(@Body() body: CompletionDto) {
    return await this.appService.completions(body);
  }

  @Post("/v1/embeddings")
  @UsePipes(new ValidationPipe({ transform: true }))
  async embeddings(@Body() body: EmbeddingDto) {
    return await this.appService.embeddings(body);
  }

  @Post("/v1/lora/train")
  @UsePipes(new ValidationPipe({ transform: true }))
  loraTrain(@Body() body: LoRATrainDto) {
    return this.appService.loraTrain(body);
  }

  @Post("/v1/fine-tune")
  @UsePipes(new ValidationPipe({ transform: true }))
  fineTune(@Body() body: FineTuneDto) {
    return this.appService.fineTune(body);
  }

  @Get("/v1/lora/status/:jobId")
  loraStatus(@Param("jobId") jobId: string) {
    return this.appService.loraStatus(jobId);
  }

  @Get("/v1/lora/result/:jobId")
  loraResult(@Param("jobId") jobId: string) {
    return this.appService.loraResult(jobId);
  }

  @Get("/v1/fine-tune/status/:jobId")
  fineTuneStatus(@Param("jobId") jobId: string) {
    return this.appService.fineTuneStatus(jobId);
  }

  @Get("/v1/fine-tune/result/:jobId")
  fineTuneResult(@Param("jobId") jobId: string) {
    return this.appService.fineTuneResult(jobId);
  }
}
