export interface CategoryDto {
  id: string;
  name: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateCategoryInput {
  name: string;
  image: string;
  displayOrder: number;
}

export interface UpdateCategoryInput {
  name?: string;
  image?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface VerifyUploadResponse {
  verified: boolean;
  viewUrl: string;
}
