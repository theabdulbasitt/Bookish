import { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';



// Type for a read book stored in AsyncStorage
interface ReadBook {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    readAt: string; // ISO date string
}

const ReadBookCard = ({
    book,
    onPress,
    onRemove,
}: {
    book: ReadBook;
    onPress: () => void;
    onRemove: () => void;
}) => {

    const formattedDate = new Date(book.readAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            {/* Book cover */}
            <Image
                source={{ uri: book.coverUrl }}
                style={styles.cover}
                resizeMode="cover"
            />

            {/* Book info */}
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {book.title}
                </Text>
                <Text style={styles.cardAuthor} numberOfLines={1}>
                    by {book.author}
                </Text>
                <View style={styles.readBadge}>
                    <Text style={styles.readBadgeText}>✓ Read</Text>
                </View>
                <Text style={styles.readDate}>Added {formattedDate}</Text>
            </View>

            {/* Remove button */}
            <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const EmptyReadList = () => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>No books read yet</Text>
        <Text style={styles.emptySubtitle}>
            When you mark a book as read from the detail screen, it will appear here.
        </Text>
    </View>
);

export default function ReadListScreen() {
    const router = useRouter();
    const [readBooks, setReadBooks] = useState<ReadBook[]>([]);

    const loadReadBooks = useCallback(() => {
        const fetchBooks = async () => {
            try {
                const stored = await AsyncStorage.getItem('readBooks');
                if (stored) {
                    const parsed: ReadBook[] = JSON.parse(stored);
                    parsed.sort((a, b) =>
                        new Date(b.readAt).getTime() - new Date(a.readAt).getTime()
                    );
                    setReadBooks(parsed);
                } else {
                    setReadBooks([]);
                }
            } catch (err) {
                setReadBooks([]);
            }
        };

        fetchBooks(); // call it immediately
        // no return here — so useFocusEffect gets nothing back ✓
    }, []);

    useFocusEffect(loadReadBooks);

    const handleRemove = (bookId: string, bookTitle: string) => {
        Alert.alert(
            'Remove Book',
            `Remove "${bookTitle}" from your read list?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updated = readBooks.filter(b => b.id !== bookId);
                            await AsyncStorage.setItem('readBooks', JSON.stringify(updated));
                            setReadBooks(updated); // update UI immediately
                        } catch {
                            Alert.alert('Error', 'Could not remove book. Try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleClearAll = () => {
        Alert.alert(
            'Clear Read List',
            'Are you sure you want to remove all books from your read list?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('readBooks');
                        setReadBooks([]);
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>

            {/* ── STATS BAR — shows count ── */}
            {readBooks.length > 0 && (
                <View style={styles.statsBar}>
                    <Text style={styles.statsText}>
                        📖 {readBooks.length} book{readBooks.length !== 1 ? 's' : ''} read
                    </Text>
                    <TouchableOpacity onPress={handleClearAll}>
                        <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ── EMPTY STATE ── */}
            {readBooks.length === 0 && <EmptyReadList />}

            {/* ── READ BOOKS LIST ── */}
            {readBooks.length > 0 && (
                <FlatList
                    data={readBooks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ReadBookCard
                            book={item}
                            onPress={() => router.push(`/book/${item.id}`)}
                            onRemove={() => handleRemove(item.id, item.title)}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.card,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    statsText: {
        fontSize: 14,
        color: Colors.text.secondary,
        fontWeight: '500',
    },
    clearAllText: {
        fontSize: 14,
        color: Colors.error,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    list: {
        padding: 16,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    cover: {
        width: 60,
        height: 90,
        borderRadius: 6,
        backgroundColor: Colors.border,
    },
    cardInfo: {
        flex: 1,
        gap: 4,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    cardAuthor: {
        fontSize: 13,
        color: Colors.text.secondary,
    },
    readBadge: {
        alignSelf: 'flex-start',   // don't stretch full width
        backgroundColor: Colors.primary + '20', // teal with 20% opacity
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginTop: 2,
    },
    readBadgeText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    readDate: {
        fontSize: 11,
        color: Colors.text.light,
        marginTop: 2,
    },
    removeButton: {
        padding: 8,
    },
    removeButtonText: {
        fontSize: 16,
        color: Colors.text.light,
    },
});