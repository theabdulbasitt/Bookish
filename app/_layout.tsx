import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Colors from '../constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: Colors.background,
                    },
                    headerTintColor: Colors.text.primary,   // back arrow color
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 18,
                    },
                    headerShadowVisible: false,  // removes the bottom border under header
                    contentStyle: {
                        backgroundColor: Colors.background,
                    },
                    animation: 'slide_from_right', // screens slide in from right
                }}
            >
                <Stack.Screen
                    name="index"           // → app/index.tsx (Home screen)
                    options={{
                        headerShown: false,  // Home screen has no header — we'll build custom one
                    }}
                />

                <Stack.Screen
                    name="search"          // → app/search.tsx
                    options={{
                        title: 'Search Book',
                        headerShown: true,
                    }}
                />

                <Stack.Screen
                    name="book/[id]"       // → app/book/[id].tsx
                    options={{
                        title: 'Book Detail',
                        headerShown: true,
                    }}
                />

                <Stack.Screen
                    name="readList"
                    options={{
                        title: 'My Read List',
                        headerShown: true,
                    }}
                />

            </Stack>
        </>
    )
}