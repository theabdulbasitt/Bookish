import { useRef, useCallback } from 'react';
import ErrorMessage from '../components/ErrorMessage';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Animated,
    TextInput,
    Keyboard,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBookSearch } from '../hooks/useBooks';
import Colors from '../constants/colors';
import { Book } from '../types/book';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SearchResultCard = ({
    book,
    onPress,
    index,
}: {
    book: Book;
    onPress: () => void;
    index: number; // used to stagger animation — card 0 first, then 1, then 2...
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;


    const hasAnimated = useRef(false);

    const animate = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                delay: index * 60,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                delay: index * 60,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    if (!hasAnimated.current) {
        hasAnimated.current = true;
        animate();
    }

    return (
        <Animated.View
            style={[
                styles.resultCard,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.resultCardInner}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {/* Cover thumbnail */}
                <Image
                    source={{ uri: book.coverUrl }}
                    style={styles.resultCover}
                    resizeMode="cover"
                />

                {/* Book info */}
                <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                        {book.title}
                    </Text>
                    <Text style={styles.resultAuthor} numberOfLines={1}>
                        by {book.author}
                    </Text>
                    {book.year !== 'Unknown' && (
                        <Text style={styles.resultYear}>{book.year}</Text>
                    )}
                    {book.rating > 0 && (
                        <View style={styles.ratingRow}>
                            <Text style={styles.starIcon}>★</Text>
                            <Text style={styles.ratingText}>{book.rating}</Text>
                            {book.reviewCount > 0 && (
                                <Text style={styles.reviewCount}>
                                    ({book.reviewCount.toLocaleString()})
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const EmptyState = () => (
    <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>Search for Books</Text>
        <Text style={styles.emptySubtitle}>
            Type a book title or author name to get started
        </Text>
    </View>
);

const NoResults = ({ query }: { query: string }) => (
    <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptySubtitle}>
            No books found for "{query}".{'\n'}Try a different search term.
        </Text>
    </View>
);

export default function SearchScreen() {
    const router = useRouter();
    const { query, setQuery, books, loading, error } = useBookSearch();

    const navigateToBook = (bookId: string) => {
        Keyboard.dismiss();
        router.push(`/book/${bookId}`);
    };

    const showEmpty = !query.trim();
    const showNoResults = query.trim() && !loading && !error && books.length === 0;
    const showResults = !loading && books.length > 0;

    return (
        <View style={styles.container}>

            {/* ── SEARCH BAR ── */}
            <View style={styles.searchBarContainer}>
                <Text style={styles.searchBarIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Book title or author..."
                    placeholderTextColor={Colors.text.light}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus={true}        // keyboard opens automatically
                    returnKeyType="search"
                    onSubmitEditing={Keyboard.dismiss}
                />
                {/* Clear button — only shows when there is text */}
                {query.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setQuery('')}
                        style={styles.clearButton}
                    >
                        <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ── RESULTS COUNT — shows when results exist ── */}
            {showResults && (
                <Text style={styles.resultsCount}>
                    {books.length} results for "{query}"
                </Text>
            )}

            {/* ── LOADING ── */}
            {loading && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            )}

            {/* ── ERROR ── */}
            {error && <ErrorMessage message={error} onRetry={() => setQuery(query)} />}

            {/* ── EMPTY STATE ── */}
            {showEmpty && <EmptyState />}

            {/* ── NO RESULTS ── */}
            {showNoResults && <NoResults query={query} />}

            {/* ── RESULTS LIST ── */}
            {showResults && (
                <FlatList
                    data={books}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <SearchResultCard
                            book={item}
                            index={index}
                            onPress={() => navigateToBook(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.resultsList}
                    onScrollBeginDrag={Keyboard.dismiss}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 12,
        backgroundColor: Colors.card,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.border,
        height: 50,
    },
    searchBarIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.text.primary,
        height: '100%',
    },
    clearButton: {
        padding: 6,
    },
    clearButtonText: {
        fontSize: 14,
        color: Colors.text.light,
    },
    resultsCount: {
        fontSize: 13,
        color: Colors.text.light,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    centerContainer: {
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
    loadingText: {
        color: Colors.text.secondary,
        fontSize: 14,
        marginTop: 12,
    },
    errorContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: '#FFF0F0',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.error,
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
    },
    resultsList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    resultCard: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    resultCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    resultCover: {
        width: 60,
        height: 90,
        borderRadius: 6,
        backgroundColor: Colors.border,
    },
    resultInfo: {
        flex: 1,
        paddingHorizontal: 12,
        gap: 4,
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    resultAuthor: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: '500',
    },
    resultYear: {
        fontSize: 12,
        color: Colors.text.light,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    starIcon: {
        color: Colors.star.filled,
        fontSize: 12,
    },
    ratingText: {
        fontSize: 12,
        color: Colors.text.secondary,
        fontWeight: '600',
    },
    reviewCount: {
        fontSize: 11,
        color: Colors.text.light,
    },
    arrowIcon: {
        fontSize: 24,
        color: Colors.text.light,
        paddingLeft: 4,
    },
});