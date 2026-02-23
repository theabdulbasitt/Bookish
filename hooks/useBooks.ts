import { useState, useEffect, useCallback } from "react";
import { searchBooks, fetchFeaturedBooks, fetchBookDetail } from "../services/bookService";
import { Book, BookDetail } from '../types/book';

//Hook for search screen
export const useBookSearch = () => {
    const [query, setQuery] = useState<string>('');
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setBooks([]);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const results = await searchBooks(searchQuery);
            setBooks(results);
        }
        catch (err: any) {
            setError(err.message);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            search(query);
        }, 500);
        return () => clearTimeout(timer);   // Cleanup: cancel the previous timer if query changes before 500ms
    }, [query, search]);

    return { query, setQuery, books, loading, error };
};


// Hook for the Home/Dashboard screen — fetches featured books on mount
export const useFeaturedBooks = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFeaturedBooks = async () => {
            try {
                const results = await fetchFeaturedBooks();
                setBooks(results);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadFeaturedBooks();
    }, []);
    return { books, loading, error };
};


export const useBookDetail = (bookId: string) => {

    const [book, setBook] = useState<BookDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBook = async () => {
            try {
                const results = await fetchBookDetail(bookId);
                setBook(results);
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        if (bookId) loadBook();
    }, [bookId]);
    return { book, loading, error };
}
