import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Searchbar, ActivityIndicator } from 'react-native-paper';
import { SCREENS, THEME } from '../config/constants';
import StorageService from '../services/StorageService';
import NoteCard from '../components/NoteCard';

const HomeScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();

    // Refresh notes when navigating back to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
    });

    return unsubscribe;
  }, [navigation]);

  const loadNotes = async () => {
    try {
      const allNotes = await StorageService.getAllNotes();
      setNotes(allNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const searchResults = await StorageService.searchNotes(query);
      setNotes(searchResults);
    } else {
      loadNotes();
    }
  };

  const renderItem = ({ item }) => (
    <NoteCard
      title={item.title}
      content={item.content}
      timestamp={item.timestamp}
      hasAudio={item.audioUri}
      onPress={() => navigation.navigate(SCREENS.NOTE_DETAIL, { noteId: item.id })}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search notes..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.fabContainer}>
        <FAB
          icon="text"
          style={[styles.fab, { right: 80 }]}
          onPress={() => navigation.navigate(SCREENS.ADD_NOTE)}
        />
        <FAB
          icon="microphone"
          style={styles.fab}
          onPress={() => navigation.navigate(SCREENS.VOICE_NOTE)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  listContainer: {
    paddingBottom: 80,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    backgroundColor: THEME.colors.primary,
  },
});

export default HomeScreen;
