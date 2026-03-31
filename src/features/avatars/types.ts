export interface Avatar {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface ListAvatarsResponse {
  avatars: Avatar[];
}

export interface AddAvatarInput {
  key: string;
}
