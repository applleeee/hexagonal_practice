import { SubCategory } from 'entity/SubCategory';

export interface ICommunityRepository {
  getAllCategories(): Promise<SubCategory[]>;
}

export const ICommunityRepository = Symbol('ICommunityRepository');
