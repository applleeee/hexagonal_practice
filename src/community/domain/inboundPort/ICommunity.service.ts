import { SubCategory } from 'entity/SubCategory';

export interface ICommunityService {
  getAllcategories(): Promise<SubCategory[]>;
}

export const ICommunityService = Symbol('ICommunityService');
