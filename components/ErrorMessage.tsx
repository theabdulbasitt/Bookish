import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void; // optional — button only shows if provided
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.message}>{message}</Text>
            {/* Only renders if onRetry function was passed in */}
            {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 16,
        padding: 16,
        backgroundColor: '#FFF0F0',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.error,
        alignItems: 'center',
        gap: 8,
    },
    icon: {
        fontSize: 32,
    },
    message: {
        color: Colors.error,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        marginTop: 4,
        backgroundColor: Colors.error,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});