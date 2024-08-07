import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const PORT = process.env.PORT || 4000;
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    const microcervice = app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: ['amqp://localhost:5672'],
            queue: 'scopework_queue',
            queueOptions: {
                durable: true,
            },
        },
    });
    const config = new DocumentBuilder()
        .setTitle('ScopeWork')
        .setDescription('ScopeWork Api')
        .setVersion('1.0')
        .addTag('ScopeWork')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);
    // // Проверяем есть ли роль admin
    // const rolesService = app.get(RolesService);
    // const typeWorkService = app.get(TypeWorkService);
    // const unitService = app.get(UnitService);
    // const roleDto: CreateRoleDto = {
    //     name: 'admin',
    //     description: 'Администратор',
    // };
    // const roleUserDto: CreateRoleDto = {
    //     name: 'user',
    //     description: 'Пользователь',
    // };
    // const roleMasterDto: CreateRoleDto = {
    //     name: 'master',
    //     description: 'Мастер',
    // };
    // const roleDevDto: CreateRoleDto = {
    //     name: 'dev',
    //     description: 'Разработчик',
    // };
    // const roleManagerDto: CreateRoleDto = {
    //     name: 'manager',
    //     description: 'Менеджер',
    // };
    // const roleDriverDto: CreateRoleDto = {
    //     name: 'driver',
    //     description: 'Водитель',
    // };
    // const roleWarehousemanDto: CreateRoleDto = {
    //     name: 'warehouseman',
    //     description: 'Кладовщик',
    // };

    // await Promise.all([
    //     await rolesService.createRole(roleDto),
    //     await rolesService.createRole(roleUserDto),
    //     await rolesService.createRole(roleMasterDto),
    //     await rolesService.createRole(roleDevDto),
    //     await rolesService.createRole(roleManagerDto),
    //     await rolesService.createRole(roleDriverDto),
    //     await rolesService.createRole(roleWarehousemanDto),
    // ]);

    // await typeWorkService.createTypeWork({
    //   name: 'АСКУЭ',
    //   description: 'Автоматизированная система',
    // });
    // await typeWorkService.createTypeWork({
    //   name: 'Водоснабжение',
    //   description: 'Водоснабжение',
    // });
    // const adminDto: CreateUserAndDescription = {
    //     email: 'admin@admin.ru',
    //     password: 'admin',
    //     firstname: 'Админ',
    //     lastname: 'Админ',
    // };

    await app.startAllMicroservices();
    await app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
    });
}
bootstrap();
