import { DataSource, DeepPartial, EntityTarget, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { WordListEntity } from '../../entities';
import { IWordsCount } from '../../interfaces/words-count';

export class EntityManager {
  constructor(protected datasource: DataSource) {}

  /**
   * Поиск сущности в БД
   * @returns null - если сущность не найдена
   * @returns ObjectLiteral - если сущность найдена
   */
  public async get<T extends ObjectLiteral>(
    target: EntityTarget<T>,
    findOptions: FindOptionsWhere<T>,
  ): Promise<T | null> {
    const foundEntity = await this.datasource.getRepository(target).findOne({ where: findOptions });
    return foundEntity ? foundEntity : null;
  }

  /**
   * Создаём новую запись в БД
   */
  public async create<T extends ObjectLiteral>(target: EntityTarget<T>, data: DeepPartial<T>): Promise<T> {
    const entityRepo = await this.datasource.getRepository(target);
    const entity = await entityRepo.create(data);
    return entityRepo.save(entity);
  }

  
  /**
   * Количество записей в бд
   */
  public async getCount<T extends ObjectLiteral>(target: EntityTarget<T>): Promise<number> {
    return await this.datasource.getRepository(target).count();
  }

  /**
   * N самых частых слов и их количество
   */
  public async getMostPopularWords(count: number = 20): Promise<IWordsCount[]> {
    const words = await this.datasource
      .getRepository(WordListEntity)
      .createQueryBuilder('wl')
      .select(['wl.word as word', 'COUNT(wl.word) as count'])
      .groupBy('wl.word')
      .orderBy('COUNT(wl.word)', 'DESC')
      .limit(count)
      .getRawMany();
    return words.map(
      word =>
        ({
          word: word.word,
          count: word.count,
        } as IWordsCount),
    );
  }
}
