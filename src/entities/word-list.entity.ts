import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

@Entity('WordList')
export class WordListEntity extends BaseEntity {
  @Column()
  public word: string;

  @Column()
  public isFiltered: boolean;
}
