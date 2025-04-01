export interface CharacterModel {
    id: string;
    name: string;
    description: string;
    filePath: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    fileSize: number;
    format: string;
    category: string;
    thumbnailUrl?: string;
    previewUrl?: string;
    searchableText?: string;
}

export interface CharacterFilter {
    search?: string;
    category?: string;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
}
