export class PostList {
  postId: number;
  title: string;
  view: number;
  createdAt: string;
  userId: number;
  userName: string;
  postLike: number;
  comment: number;
  subCategoryName: string;
}

export class PostDetail {
  postTitle: string;
  postId: number;
  userId: number;
  content: string;
  userName: string;
  subCategoryId: number;
  subCategoryName: string;
  createdAt: string;
  isLogin?: boolean;
  isAuthor?: boolean;
  ifLiked?: boolean;
}
