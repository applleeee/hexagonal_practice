import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SubCategory } from './SubCategory';

@Entity('main_category', { schema: 'hexagonal_practice' })
export class MainCategory {
  @PrimaryGeneratedColumn({ type: 'tinyint', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'name', nullable: false, length: 200 })
  name: string;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.mainCategory)
  subCategories: SubCategory[];
}
