import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base/base.entity";

@Entity('UrlList')
export class UrlListEntity extends BaseEntity {
  @Column()
  public url:string;
}
