import { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFeaturedBooks } from '../hooks/useBooks';
import Colors from '../constants/colors';
import { Book } from '../types/book';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.38;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const FeaturedBookCard = ({ book, onPress }: { book: Book; onPress: () => void }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.93,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={styles.coverImage}
                        resizeMode="cover"
                    />
                    {book.rating > 0 && (
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingBadgeStar}>★</Text>
                            <Text style={styles.ratingBadgeText}>{book.rating}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{book.title}</Text>
                    <Text style={styles.cardAuthor} numberOfLines={1}>{book.author}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function HomeScreen() {
    const router = useRouter();
    const { books, loading, error } = useFeaturedBooks();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const navigateToSearch = () => router.push('/search');
    const navigateToBook = (bookId: string) => router.push(`/book/${bookId}`);

    return (
        <View style={styles.container}>

            {/* ── HEADER ── */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Left side — greeting and app name */}
                <View>
                    <Text style={styles.appName}>BookExplorer</Text>
                </View>

                {/* Right side — two icon buttons */}
                <View style={styles.headerButtons}>
                    {/* Search button */}
                    <TouchableOpacity
                        onPress={navigateToSearch}
                        style={styles.searchIconButton}
                    >
                        <Text style={styles.searchIconText}>🔍</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* ── SECTION HEADER ── */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Books</Text>
                <TouchableOpacity onPress={navigateToSearch}>
                    <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>

            {/* ── LOADING ── */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading books...</Text>
                </View>
            )}

            {/* ── ERROR ── */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={styles.errorSub}>Please check your connection</Text>
                </View>
            )}

            {!loading && !error && (
                <View style={styles.rowsContainer}>

                    {/* Row 1 — first 10 books */}
                    <FlatList
                        data={books.slice(0, 10)}
                        keyExtractor={(item) => `row1-${item.id}`}
                        renderItem={({ item }) => (
                            <FeaturedBookCard
                                book={item}
                                onPress={() => navigateToBook(item.id)}
                            />
                        )}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.booksList}
                    />

                    {/* Row 2 — next 10 books, scrolls independently */}
                    <FlatList
                        data={books.slice(10, 20)}
                        keyExtractor={(item) => `row2-${item.id}`}
                        renderItem={({ item }) => (
                            <FeaturedBookCard
                                book={item}
                                onPress={() => navigateToBook(item.id)}
                            />
                        )}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.booksList}
                    />

                </View>
            )}

            {/* ── READ LIST BUTTON ── */}
            <TouchableOpacity
                style={styles.searchButton}
                onPress={() => router.push('/readList')}
            >
                <Text style={styles.searchButtonText}>📖  My Read List</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: (StatusBar.currentHeight || 40) + 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    greeting: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: 2,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    searchIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    searchIconText: {
        fontSize: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    seeAllText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: Colors.text.secondary,
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: Colors.error,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    errorSub: {
        color: Colors.text.secondary,
        fontSize: 14,
        marginTop: 8,
    },
    rowsContainer: {
        flex: 1,
        gap: 8,
    },
    booksList: {
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 8,
    },
    cardContainer: {
        width: CARD_WIDTH,
        backgroundColor: Colors.card,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: {
        position: 'relative',
    },
    coverImage: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    },
    ratingBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    ratingBadgeStar: {
        color: Colors.star.filled,
        fontSize: 11,
    },
    ratingBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    cardInfo: {
        padding: 10,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    cardAuthor: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
    searchButton: {
        margin: 20,
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    searchButtonText: {
        color: Colors.text.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});