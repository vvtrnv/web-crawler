import "reflect-metadata"
import { DataSource } from "typeorm"
import * as entities from './entities'
import * as migrations from './migrations';
import { DotenvConfigOutput, config } from "dotenv";


/** Чтение конфига */
export const loadEnv = () => {
  let cfg: DotenvConfigOutput;
  cfg ??= (() => {
    const parsed = config({ path: './src/config/.env' });
    parsed.error && console.error('Web-crawler:: .env parsing failed. Using default dev variables.', parsed.error?.message);
    !parsed.error && console.log('Web-crawler:: .env parsing success');
    return parsed;
  })();
}

/** Вызов чтения конфига для корректной работы (иначе ошибка) */
loadEnv();

/** Настройки подключения бд */
export const AppDataSource = new DataSource({
    type: 'better-sqlite3',
		database: process.env.DATABASE,
    synchronize: false,
		migrationsRun: true,
    logging: false,
    entities: entities,
    migrations: migrations,
    logger: 'simple-console',
})
