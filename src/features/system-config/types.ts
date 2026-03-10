export type ConfigValueType = 'number' | 'string' | 'boolean';

export interface ConfigDTO {
  id: string;
  key: string;
  value: string;
  valueType: ConfigValueType;
  category: string;
  displayName: string;
  description: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface ConfigsByCategoryDTO {
  category: string;
  configs: ConfigDTO[];
}
