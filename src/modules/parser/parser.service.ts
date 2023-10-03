import axios from 'axios';
import * as cheerioModule from 'cheerio';
import {
  LinkBetweenUrlEntity,
  LinkWordEntity,
  UrlListEntity,
  WordListEntity,
  WordLocationEntity,
} from '../../entities';
import { EntityManager } from '../entity-manager/entity.manager';
import { BaseEntity } from '../../base/base.entity';
import { DeepPartial, EntityTarget, FindOptionsWhere } from 'typeorm';

export class ParserService {
  private ignoreWordsList = ['и', 'а', 'но', 'за', 'по'];
  private indexed = 0;
  constructor(private baseUrl: string, private entityManagerService: EntityManager) {}

  /**
   * Непосредственно сам метод сбора данных.
   * Начиная с заданного списка страниц, выполняет поиск в ширину
   * до заданной глубины, индексируя все встречающиеся по пути страницы
   */
  public async crawl(urlList: string[] = [this.baseUrl], maxDepth: number = 3) {
    let urlListCopy = [...urlList];

    for (let currDepth = 0; currDepth < maxDepth; currDepth++) {
      const nextUrlsSet: Set<string> = new Set();
      for (const url of urlListCopy) {
        /** проблемная страница */
        if (url === 'https://history.eco/karta-sajta/') {
          continue;
        }
        console.log(url);

        const response = await axios.get(url).catch(err => console.warn(`WARN: loading url: ${url}`));
        if (!response) {
          continue;
        }
        const html = response.data;

        const urlEntity = await this.getOrCreateEntity(UrlListEntity, { url: url }, { url: url });

        let $ = cheerioModule.load(html);

        /** Формируем новые страницы для обхода */
        const links = $('a');
        await Promise.all(
          links.map(async (_, link) => {
            const href = $(link).attr('href');
            const text = $(link).text();

            if (href && (href.startsWith('https') || href.startsWith('http'))) {
              /** Убираем якоря */
              const cleanedUrl = href.replace(/#.*$/, '');

              nextUrlsSet.add(cleanedUrl);
              const newUrlEntity = await this.getOrCreateEntity(
                UrlListEntity,
                { url: cleanedUrl },
                { url: cleanedUrl },
              );

              if (url) {
                await this.linkWordWithUrl(text, urlEntity, newUrlEntity);
              }
            }
          }),
        );

        /** Добавляем в индекс */
        await this.addIndex(urlEntity, $);
      }
      /** Новые ссылки для обхода */
      urlListCopy = Array.from(nextUrlsSet);
    }
  }

  public async log(): Promise<void> {
    const counts = {} as any;
    counts.urls = await this.entityManagerService.getCount(UrlListEntity);
    counts.words = await this.entityManagerService.getCount(WordListEntity);
    counts.wordLocations = await this.entityManagerService.getCount(WordLocationEntity);
    counts.linksBetweenWords = await this.entityManagerService.getCount(LinkBetweenUrlEntity);
    counts.linksWord = await this.entityManagerService.getCount(LinkWordEntity);

    console.log('Counts of entities:');
    console.log(JSON.stringify(counts));
  }

  /**
   * Индексирование одной страницы
   */
  public async addIndex(urlEntity: UrlListEntity, $: cheerio.Root): Promise<UrlListEntity | null> {
    if (await this.isIndexed(urlEntity)) {
      return null;
    }

    /** Сбор статистики */
    /** Логируем количество элементов в таблице */
    console.log(this.indexed);
    if (this.indexed % 10 === 0) {
      console.log(`${this.indexed} iteration`);
      await this.log();
    }
    this.indexed++;

    const text: string = await this.getTextOnly($);
    const words: string[] = this.separateWords(text);

    /** Проверяем наличие слов  */
    for (let numWord = 0; numWord < words.length; numWord++) {
      const word = words[numWord];
      /** Английское слово или слово из списка игнорируемых */
      if (this.isEnglishWord(word) || this.ignoreWordsList.includes(word)) {
        continue;
      }

      const wordEntity = await this.entityManagerService.create(WordListEntity, { word: word, isFiltered: true });

      /** Заносим данные о положении слова */
      const insertedWordLocation = await this.entityManagerService.create(WordLocationEntity, {
        word: { id: wordEntity.id },
        url: { id: urlEntity.id },
        location: numWord,
      });
    }

    return urlEntity;
  }

  /**
   * Проиндексирован ли URL (проверка наличия URL в БД)
   */
  public async isIndexed(urlEntity: UrlListEntity) {
    /** Проверяем есть ли ссылка в UrlList */
    // const foundUrl = await this.entityManagerService.get(UrlListEntity, { url: urlEntity.id });
    // if (!foundUrl) {
    //   return false;
    // }

    const foundWordLocation = await this.entityManagerService.get(WordLocationEntity, {
      url: { id: urlEntity.id },
    });
    if (foundWordLocation) {
      return true;
    }

    return false;
  }

  /**
   * Разбиение текста на слова
   */
  public separateWords(text: string): string[] {
    return text.split(/\s+/);
  }

  /**
   * Получение текста страницы
   */
  public getTextOnly($: cheerio.Root): string {
    $ = this.clearHtmlPage($);
    const body = $('body').text();

    /** Получаем текст */
    const text = this.getStringFromHtml(body);
    return text;
  }

  /**
   * Убрать комментарии и скрипты из html
   */
  private clearHtmlPage($: cheerio.Root): cheerio.Root {
    // Удаляем все комментарии
    $('*').each((i, el) => {
      if (el.type === 'comment') {
        $(el).remove();
      }
    });

    // Удаляем все скрипты
    $('script').remove();

    return $;
  }

  /**
   * Извлечение текста без html тэгов
   */
  private getStringFromHtml(html: string): string {
    // const res = html.replace(/<\/[^>]+>/g, ' ').replace(/<[^>]+>/g, '');
    const res = html.replace(/<[^>]+>/g, ' ');
    return res.trim();
  }

  /**
   * Добавление ссылки с одной страницы на другую
   */
  public async linkWordWithUrl(linkText: string, urlFrom: UrlListEntity, urlTo: UrlListEntity) {
    const linkBetweenUrl = await this.entityManagerService.create(LinkBetweenUrlEntity, {
      fromUrl: { id: urlFrom.id },
      toUrl: { id: urlTo.id },
    });

    const textWithoutTags = this.getStringFromHtml(linkText);
    const words: string[] = this.separateWords(textWithoutTags);

    for (const word of words) {
      if (this.isEnglishWord(word) || this.ignoreWordsList.includes(word)) {
        continue;
      }
      const wordEntity = await this.getOrCreateEntity(WordListEntity, { word: word }, { word: word, isFiltered: true });

      await this.entityManagerService.create(LinkWordEntity, {
        word: { id: wordEntity.id },
        link: { id: linkBetweenUrl.id },
      });
    }
  }

  /**
   * Проверка на английское словов
   */
  private isEnglishWord(text: string): boolean {
    const relugarExpPattern = /[a-zA-Z]+/g;
    return relugarExpPattern.test(text);
  }

  /**
   * Проверяем наличие иначе создаём
   */
  private async getOrCreateEntity<T extends BaseEntity>(
    target: EntityTarget<T>,
    findData: FindOptionsWhere<T>,
    createData: DeepPartial<T>,
  ): Promise<T> {
    let entity: T = await this.entityManagerService.get<T>(target, findData);
    if (!entity) {
      entity = await this.entityManagerService.create<T>(target, createData);
    }

    return entity;
  }

  private async addLink(url: string): Promise<UrlListEntity> {
    return await this.entityManagerService.create(UrlListEntity, { url });
  }
}
