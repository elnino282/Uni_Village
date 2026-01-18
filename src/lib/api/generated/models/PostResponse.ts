/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PostType } from './PostType';
import type { Visibility } from './Visibility';
export type PostResponse = {
    id?: number;
    content?: string;
    postType?: PostType;
    visibility?: Visibility;
    authorId?: number;
    authorName?: string;
    authorAvatarUrl?: string;
    mediaUrls?: Array<string>;
    createdAt?: string;
    updatedAt?: string;
};

