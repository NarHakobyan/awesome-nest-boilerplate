import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { ITypeOrmConfig } from '../../interfaces/typeorm-config.interface';

export class ConfigService {
    private readonly _config: { [property: string]: string };

    constructor() {
        const env = process.env.NODE_ENV || 'development';

        this._config = dotenv.parse(fs.readFileSync(`.${env}.env`));
        this._config = dotenvExpand({ parsed: this._config }).parsed;

        // Replace \\n with \n to support multiline strings in AWS
        this._config = Object.keys(this._config).reduce((object, key) => {
            return { ...object, [key]: this._config[key].replace(/\\n/g, '\n') };
        }, {});
    }

    public get(key: string): string {
        return this._config[key];
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
            logging: process.env.NODE_ENV === 'development',
        };
    }
}
