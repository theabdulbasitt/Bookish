export interface OpenLibraryBook {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    number_of_pages_median?: number;
    ratings_average?: number;
    ratings_count?: number;
    subject: string[];
}

export interface Book {
    id: string;
    title: string;
    author: string;
    year: string;
    coverUrl: string;
    rating: number;
    reviewCount: number;
    subjects: string[];
}

export interface OpenLibrarySearchResponse {
    numFound: number;
    docs: OpenLibraryBook[];
}

export interface BookDetail extends Book {
    description: string;
    authorBio: string;
}