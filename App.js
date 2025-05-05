import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SCREENS, THEME } from './src/config/constants';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import AddNoteScreen from './src/screens/AddNoteScreen';
import VoiceNoteScreen from './src/screens/VoiceNoteScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...THEME,
  roundness: 2,
  version: 3,
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={SCREENS.HOME}
          screenOptions={{
            headerStyle: {
              backgroundColor: THEME.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name={SCREENS.HOME}
            component={HomeScreen}
            options={{
              title: 'My Notes',
            }}
          />
          <Stack.Screen
            name={SCREENS.ADD_NOTE}
            component={AddNoteScreen}
            options={{
              title: 'Add Note',
            }}
          />
          <Stack.Screen
            name={SCREENS.VOICE_NOTE}
            component={VoiceNoteScreen}
            options={{
              title: 'Voice Note',
            }}
          />
          <Stack.Screen
            name={SCREENS.NOTE_DETAIL}
            component={NoteDetailScreen}
            options={{
              title: 'Note Details',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
