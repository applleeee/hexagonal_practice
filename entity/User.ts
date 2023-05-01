import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './Comment';
import { CommentLike } from './CommentLike';
import { Post } from './Post';
import { PostLike } from './PostLike';

@Entity('user', { schema: 'hexagonal_practice' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', {
    name: 'email',
    nullable: false,
    unique: true,
    length: 100,
  })
  email: string;

  @Column('varchar', {
    name: 'username',
    nullable: false,
    unique: true,
    length: 50,
  })
  userName: string;

  @Column('varchar')
  password: string;

  @Column('timestamp', { name: 'created_at', default: () => "'now()'" })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user)
  commentLikes: CommentLike[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => PostLike, (postLike) => postLike.user)
  postLikes: PostLike[];
}
