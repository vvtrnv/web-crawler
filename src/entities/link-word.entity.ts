import { WordListEntity } from "./word-list.entity";
import { Entity, ManyToOne, RelationId } from "typeorm";
import { LinkBetweenUrlEntity } from "./link-between-url.entity";
import { BaseEntity } from "../base/base.entity";

@Entity('LinkWord')
export class LinkWordEntity extends BaseEntity {
  @ManyToOne(() => WordListEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  public word: WordListEntity;

  @RelationId((entity: LinkWordEntity) => entity.word)
  public wordId: number;

  @ManyToOne(() => LinkBetweenUrlEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true,
    eager: true,
  })
  public link: LinkBetweenUrlEntity;

  @RelationId((entity: LinkWordEntity) => entity.link)
  public linkId: number;
}