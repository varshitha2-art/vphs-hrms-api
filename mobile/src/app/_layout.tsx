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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'VPHS HRMS Login',
          }}
        />

        <Stack.Screen
          name="dashboard"
          options={{
            headerShown: false,
            title: 'VPHS HRMS Dashboard',
          }}
        />

        <Stack.Screen
          name="employees"
          options={{
            headerShown: false,
            title: 'VPHS Employees',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
