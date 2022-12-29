import { DocumentBuilder } from '@nestjs/swagger';

const swaggerConfig = new DocumentBuilder()
  .setTitle('Bunker')
  .setDescription('The Bunker API Document')
  .setVersion('1.0')
  .build();

export { swaggerConfig };
