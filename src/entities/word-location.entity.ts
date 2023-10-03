import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { UrlListEntity } from "./url-list.entity";
import { WordListEntity } from "./word-list.entity";
import { BaseEntity } from "../base/base.entity";

@Entity('WordLocation')
export class WordLocationEntity extends BaseEntity {
  @ManyToOne(() => WordListEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true,
    eager: true,
  })
  public word: WordListEntity;

  @RelationId((entity: WordLocationEntity) => entity.word)
  public wordId: number;

  @ManyToOne(() => UrlListEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true,
    eager: true,
  })
  public url: UrlListEntity;

  @RelationId((entity: WordLocationEntity) => entity.url)
  public urlId: number;

  @Column()
  public location: number;
}
