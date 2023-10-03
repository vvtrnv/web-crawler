import { AppDataSource } from './data-source';
import { ParserService } from './modules/parser/parser.service';
import { EntityManager } from './modules/entity-manager/entity.manager';

const bootstrap = async () => {
	/** Значения из конфига или при его отсутствии - по умолчанию */
	const dbname = process.env.DATABASE ?? 'dev_crawler';
	const baseUrl = process.env.BASE_URL ?? 'https://google.com';

	/** Инициализация БД */
  await AppDataSource.initialize().then(() => console.log(`Web-crawler:: Database "${dbname}" initialized`));

	const entityManager = new EntityManager(AppDataSource);
	const parser = new ParserService(baseUrl, entityManager);
	await parser.crawl();

	/** Топ 20 наиболее часто встречающихся слов */
	console.log('Web-crawler:: Most popular words:');
	console.log(await entityManager.getMostPopularWords(20));
};


bootstrap().catch((err: Error) => {
  console.error('Bootstrap failed:', err.message);
});
