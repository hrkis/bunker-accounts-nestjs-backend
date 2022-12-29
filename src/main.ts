import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { swaggerConfig } from './config/swagger';
import { ApiGuard } from './auth/api.guard';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new ApiGuard());
  app.enableCors();
  if (JSON.parse(process.env.OPEN_API) as boolean) {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT);
  console.log('Server listening on port ' + process.env.PORT);
}
bootstrap();
