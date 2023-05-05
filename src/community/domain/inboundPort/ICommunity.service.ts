import { SubCategory } from 'entity/SubCategory';

export interface ICommunityService {
  getAllcategories(): Promise<SubCategory[]>;

  saveImageToS3(image: Express.Multer.File, userId: number): any;
}

export const ICommunityService = Symbol('ICommunityService');
