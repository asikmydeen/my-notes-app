import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { THEME } from '../config/constants';

const NoteCard = ({ title, content, timestamp, onPress, hasAudio }) => {
  const formattedDate = new Date(timestamp).toLocaleString();
  const previewContent = content.length > 100 ? `${content.substring(0, 100)}...` : content;

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Title style={styles.title}>
          {hasAudio && '🎤 '}{title || 'Untitled Note'}
        </Title>
        <Paragraph style={styles.content}>{previewContent}</Paragraph>
        <Paragraph style={styles.timestamp}>{formattedDate}</Paragraph>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    borderRadius: 8,
    backgroundColor: THEME.colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.primary,
  },
  content: {
    marginTop: 8,
    color: THEME.colors.text,
  },
  timestamp: {
    marginTop: 8,
    fontSize: 12,
    color: THEME.colors.disabled,
  },
});

export default NoteCard;
