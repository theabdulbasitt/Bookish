import { useRef, useEffect } from 'react';
import ErrorMessage from '../../components/ErrorMessage';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    Dimensions,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBookDetail } from '../../hooks/useBooks';
import Colors from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_WIDTH = SCREEN_WIDTH * 0.45;
const COVER_HEIGHT = COVER_WIDTH * 1.5;

const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {

    const stars = Array.from({ length: 5 }, (_, index) => index < Math.round(rating));

    return (
        <View style={styles.starContainer}>
            <View style={styles.starsRow}>
                {stars.map((filled, index) => (
                    <Text
                        key={index}
                        style={[styles.star, filled ? styles.starFilled : styles.starEmpty]}
                    >
                        ★
                    </Text>
                ))}
            </View>
            <Text style={styles.ratingNumber}>{rating > 0 ? rating : 'N/A'}</Text>
            {reviewCount > 0 && (
                <Text style={styles.reviewCount}>
                    ({reviewCount.toLocaleString()} reviews)
                </Text>
            )}
        </View>
    );
};

const Section = ({ title, content }: { title: string; content: string }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionContent}>{content}</Text>
    </View>
);

export default function BookDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { book, loading, error } = useBookDetail(id as string);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        if (book) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [book]); // runs when book changes from null → loaded data
    // console.log(book);

    const handleMarkAsRead = async () => {
        try {
            // Get existing read books from storage
            const existing = await AsyncStorage.getItem('readBooks');

            // Parse JSON string back to array, or start with empty array
            const readBooks = existing ? JSON.parse(existing) : [];

            // Check if this book is already marked as read
            const alreadyRead = readBooks.find((b: any) => b.id === book?.id);

            if (alreadyRead) {
                Alert.alert('Already Read', `"${book?.title}" is already in your read list!`);
                return;
            }

            // Add current book to the array
            const updatedBooks = [
                ...readBooks,
                {
                    id: book?.id,
                    title: book?.title,
                    author: book?.author,
                    coverUrl: book?.coverUrl,
                    readAt: new Date().toISOString(), // timestamp of when marked as read
                },
            ];

            // Save back to storage as JSON string
            await AsyncStorage.setItem('readBooks', JSON.stringify(updatedBooks));

            Alert.alert(
                '✓ Marked as Read',
                `"${book?.title}" added to your read list!`,
                [{ text: 'Great!', style: 'default' }]
            );
        } catch (err) {
            Alert.alert('Error', 'Could not save. Please try again.');
        }
    };

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading book details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <ErrorMessage message={error} onRetry={() => router.back()} />
            </View>
        );
    }
    if (!book) return null;

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* ── BOOK COVER + BASIC INFO ── */}
            <Animated.View
                style={[
                    styles.heroSection,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Cover image with shadow */}
                <View style={styles.coverShadow}>
                    <Image
                        source={{ uri: book.coverUrl }}
                        style={styles.coverImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Title, author, year */}
                <Text style={styles.title}>{book.title}</Text>
                <Text style={styles.author}>{book.author}</Text>
                {book.year !== 'N/A' && (
                    <Text style={styles.year}>Published in {book.year}</Text>
                )}

                {/* Star rating */}
                <StarRating rating={book.rating} reviewCount={book.reviewCount} />
            </Animated.View>

            {/* ── BOOK DETAILS ── */}
            <Animated.View
                style={[
                    styles.detailsSection,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Subjects/tags — only show if we have some */}
                {book.subjects.length > 0 && (
                    <View style={styles.subjectsContainer}>
                        {book.subjects.map((subject, index) => (
                            <View key={index} style={styles.subjectTag}>
                                <Text style={styles.subjectText} numberOfLines={1}>
                                    {subject}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Author bio section */}
                {book.authorBio && book.authorBio !== 'No author information available.' && (
                    <Section title="About the author" content={book.authorBio} />
                )}

                {/* Overview/description section */}
                {book.description && book.description !== 'No description available.' && (
                    <Section title="Overview" content={book.description} />
                )}

                {/* ── MARK AS READ BUTTON ── */}
                <TouchableOpacity
                    style={styles.readButton}
                    onPress={handleMarkAsRead}
                    activeOpacity={0.85}
                >
                    <Text style={styles.readButtonText}>✓  Book Read</Text>
                </TouchableOpacity>

            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: 20,
    },
    loadingText: {
        color: Colors.text.secondary,
        fontSize: 14,
    },
    errorIcon: {
        fontSize: 48,
    },
    errorText: {
        color: Colors.error,
        fontSize: 15,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: Colors.text.white,
        fontWeight: '600',
    },
    heroSection: {
        alignItems: 'center',
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    coverShadow: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        borderRadius: 8,
        marginBottom: 20,
    },
    coverImage: {
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        borderRadius: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    author: {
        fontSize: 16,
        color: Colors.text.secondary,
        marginBottom: 4,
    },
    year: {
        fontSize: 13,
        color: Colors.text.light,
        marginBottom: 12,
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    star: {
        fontSize: 20,
    },
    starFilled: {
        color: Colors.star.filled,
    },
    starEmpty: {
        color: Colors.star.empty,
    },
    ratingNumber: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    reviewCount: {
        fontSize: 12,
        color: Colors.text.light,
    },
    detailsSection: {
        padding: 20,
        gap: 20,
    },
    subjectsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // wrap to next line if too many tags
        gap: 8,
    },
    subjectTag: {
        backgroundColor: Colors.card,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: Colors.border,
        maxWidth: SCREEN_WIDTH * 0.45,
    },
    subjectText: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    sectionContent: {
        fontSize: 14,
        color: Colors.text.secondary,
        lineHeight: 24,
    },
    readButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    readButtonText: {
        color: Colors.text.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});