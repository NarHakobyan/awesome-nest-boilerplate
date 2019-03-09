import * as dotenv from 'dotenv';
import { ITypeOrmConfig } from '../../interfaces/typeorm-config.interface';

export class ConfigService {
    constructor() {
        process.env.NODE_ENV = process.env.NODE_ENV || 'development';

        dotenv.config({
            path: `.${process.env.NODE_ENV}.env`,
        });

        // Replace \\n with \n to support multiline strings in AWS
        for (const envName of Object.keys(process.env)) {
            process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
        }
    }

    public get(key: string): string {
        return process.env[key];
    }

    public getNumber(key: string): number {
        return Number(this.get(key));
    }

    get typeOrmConfig(): ITypeOrmConfig {
        return {
            type: 'postgres',
            host: this.get('POSTGRES_HOST'),
            port: this.getNumber('POSTGRES_PORT'),
            username: this.get('POSTGRES_USERNAME'),
            password: this.get('POSTGRES_PASSWORD'),
            database: this.get('POSTGRES_DATABASE'),
            entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
            migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
            migrationsRun: true,
            logging: this.get('NODE_ENV') === 'development',
        };
    }
}
