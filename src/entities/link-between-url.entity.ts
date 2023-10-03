import { BaseEntity } from '../base/base.entity';
import { UrlListEntity } from './url-list.entity';
import { Entity, ManyToOne, RelationId } from 'typeorm';

@Entity('LinkBetweenUrl')
export class LinkBetweenUrlEntity extends BaseEntity {
  @ManyToOne(() => UrlListEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true,
    eager: true,
  })
  public fromUrl: UrlListEntity;

  @RelationId((entity: LinkBetweenUrlEntity) => entity.fromUrl)
  public fromUrlId: number;

  @ManyToOne(() => UrlListEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true,
    eager: true,
  })
  public toUrl: UrlListEntity;

  @RelationId((entity: LinkBetweenUrlEntity) => entity.toUrl)
  public toUrlId: number;
}
