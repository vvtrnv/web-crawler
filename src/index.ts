import { AppDataSource } from './data-source';
import { ParserService } from './modules/parser/parser.service';
import { EntityManager } from './modules/entity-manager/entity.manager';

const bootstrap = async () => {
	const dbname = process.env.DATABASE;
	const baseUrls = (process.env.BASE_URL ?? "").split(",");

	if (!baseUrls) throw new Error('Unknown base urls')
	if (!dbname) throw new Error('Unknown database name')

  await AppDataSource.initialize().then(() => console.log(`Web-crawler:: Database "${dbname}" initialized`));

	const entityManager = new EntityManager(AppDataSource);
	const parser = new ParserService(entityManager);
	await parser.crawl(baseUrls, 2);

	console.log('Web-crawler:: Most popular words:');
	console.log(await entityManager.getMostPopularWords(20));
};


bootstrap().catch((err: Error) => {
  console.error('Bootstrap failed:', err.message);
});
