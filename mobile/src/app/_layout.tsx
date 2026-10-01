import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'VPHS HRMS Login',
          }}
        />

        <Stack.Screen
          name="dashboard"
          options={{
            title: 'VPHS HRMS Dashboard',
          }}
        />

        <Stack.Screen
          name="employees"
          options={{
            title: 'VPHS Employees',
          }}
        />

        <Stack.Screen
          name="attendance"
          options={{
            title: 'VPHS Attendance',
          }}
        />

        <Stack.Screen
          name="explore"
          options={{
            title: 'VPHS Explore',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
