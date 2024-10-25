import { DataSource, DeepPartial, EntityTarget, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { WordListEntity } from '../../entities';
import { IWordsCount } from '../../interfaces/words-count';

export class EntityManager {
  constructor(protected datasource: DataSource) {}

  public async get<T extends ObjectLiteral>(
    target: EntityTarget<T>,
    findOptions: FindOptionsWhere<T>,
  ): Promise<T | null> {
    const foundEntity = await this.datasource.getRepository(target).findOne({ where: findOptions });
    return foundEntity ? foundEntity : null;
  }

  public async create<T extends ObjectLiteral>(target: EntityTarget<T>, data: DeepPartial<T>): Promise<T> {
    const entityRepo = await this.datasource.getRepository(target);
    const entity = await entityRepo.create(data);
    return entityRepo.save(entity);
  }

  public async getCount<T extends ObjectLiteral>(target: EntityTarget<T>): Promise<number> {
    return await this.datasource.getRepository(target).count();
  }

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
