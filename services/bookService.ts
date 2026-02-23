import axios from "axios";
import { OpenLibrarySearchResponse, Book, BookDetail } from "../types/book";

const BASE_URL = 'https://openlibrary.org';
const COVERS_URL = 'https://covers.openlibrary.org/b';

// Helper function — builds the cover image URL from a cover ID.
const buildCoverUrl = (coverId?: number): string => {
    if (!coverId) {
        return 'https://via.placeholder.com/150x200?text=No+Cover';
    }
    return `${COVERS_URL}/id/${coverId}-M.jpg`;
};

// Helper function — transforms raw API data into our clean Book type.
const transformBook = (rawBook: any): Book => ({
    id: rawBook.key?.replace('/works/', '') || '',
    title: rawBook.title || 'Unknown Title',
    author: rawBook.author_name?.join(', ') || 'Unknown Author',
    year: rawBook.first_publish_year?.toString() || rawBook.first_publish_year?.[0]?.toString() || 'Unknown',
    coverUrl: buildCoverUrl(rawBook.cover_i),
    rating: rawBook.ratings_average ? parseFloat(rawBook.ratings_average.toFixed(1)) : rawBook.ratings_count > 100 ? 3.5 : 0,
    reviewCount: rawBook.ratings_count || 0,
    subjects: rawBook.subject?.slice(0, 5) || [],
});

const cleanDescription = (text: string): string => {
    return text
        // Remove "Contains:", "Also contained in:", "Also published as:" sections
        // and everything after them until the next blank line
        .replace(/^(contains|also contained in|also published as|contents|includes)[:\s].*$/gim, '')
        .replace(/\([^)]*source[^)]*\)/gi, '')
        // Remove ([number]) references like ([1], [2])
        .replace(/\(\[[^\]]*\]\)/g, '')
        // Remove [text][number] markdown links
        .replace(/\[([^\]]+)\]\[\d+\]/g, '$1')
        // Remove [text](url) markdown links
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove reference lines like [1]: http...
        .replace(/\[\d+\]:[^\n]*/g, '')
        // Remove remaining [number] references
        .replace(/\[\d+\]/g, '')
        // Remove **bold** markers
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        // Remove *italic* markers
        .replace(/\*([^*]+)\*/g, '$1')
        // Remove --- and ___ dividers
        .replace(/[-_]{2,}/g, '')
        // Remove ## headings
        .replace(/#{1,6}\s/g, '')
        // Remove lines starting with - (bullet points)
        .replace(/^\s*-\s+.*/gm, '')
        // Remove lines starting with : or that are just a colon
        .replace(/^\s*:.*$/gm, '')
        // Remove ALL CAPS words (3+ chars)
        .replace(/\b([A-Z]{3,})\b/g, (match) =>
            match.charAt(0) + match.slice(1).toLowerCase()
        )
        // Remove leftover standalone brackets
        .replace(/\[\]/g, '')
        .replace(/\(\)/g, '')
        // Remove lines that are only punctuation or whitespace
        .replace(/^[^a-zA-Z0-9]+$/gm, '')
        // Collapse 3+ newlines into max 2
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

export const searchBooks = async (query: string): Promise<Book[]> => {
    try {
        const response = await axios.get<OpenLibrarySearchResponse>(`${BASE_URL}/search.json`,
            {
                params: {
                    q: query,
                    limit: 20,
                    fields: 'key,title,author_name,first_publish_year,cover_i,ratings_average,ratings_count,subject,edition_count',
                },
            }
        );
        return response.data.docs.map(transformBook);
    }
    catch (error) {
        throw new Error('Failed to search books. Please check your connection');
    }
};


export const fetchFeaturedBooks = async (): Promise<Book[]> => {
    try {
        const response = await axios.get<OpenLibrarySearchResponse>(
            `${BASE_URL}/search.json`,
            {
                params: {
                    q: 'popular fiction classics',
                    limit: 20,
                    sort: 'rating',
                    fields: 'key,title,author_name,first_publish_year,cover_i,ratings_average,ratings_count',
                },
            }
        );
        // Filter out books with no cover — looks bad on dashboard
        return response.data.docs.filter(book => book.cover_i).map(transformBook);
    }
    catch (error) {
        throw new Error('Failed to fetch featured books. Please check your connection');
    }
};


export const fetchBookDetail = async (bookId: string): Promise<BookDetail> => {
    try {

        const [workResponse, searchResponse] = await Promise.all([
            axios.get(`${BASE_URL}/works/${bookId}.json`),
            axios.get<OpenLibrarySearchResponse>(`${BASE_URL}/search.json`, {
                params: { q: bookId, fields: 'key,title,author_name,first_publish_year,cover_i,ratings_average,ratings_count,subject' }
            })
        ]);

        // Promise.all runs both requests at the SAME TIME instead of one after another
        // This cuts loading time roughly in half
        const work = workResponse.data;
        const searchBook = searchResponse.data.docs[0];
        const baseBook = transformBook(searchBook || { key: `/works/${bookId}` });

        const description = typeof work.description === 'string'
            ? cleanDescription(work.description)
            : cleanDescription(work.description?.value || 'No description available.');

        // Fetch author bio if author key exists
        let authorBio = 'No author information available.';
        if (work.authors?.[0]?.author?.key) {
            try {
                const authorResponse = await axios.get(
                    `${BASE_URL}${work.authors[0].author.key}.json`
                );
                const bio = authorResponse.data.bio;
                authorBio = typeof bio === 'string'
                    ? cleanDescription(bio)
                    : cleanDescription(bio?.value || authorBio);
            }
            catch (error) {

            }
        }
        return {
            ...baseBook,
            description,
            authorBio,
        };
    }
    catch (error) {
        throw new Error('Failed to fetch book details.');
    }
};






