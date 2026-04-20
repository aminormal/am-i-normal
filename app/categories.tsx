import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const categories = [
  { slug: 'all', name: '✨ All Categories' },
  { slug: 'awkward', name: '😬 Awkward' },
  { slug: 'crushes', name: '💔 Crushes & Relationships' },
  { slug: 'secrets', name: '🤐 Secrets' },
  { slug: 'overthinking', name: '🧠 Overthinking' },
  { slug: 'regret', name: '😔 Regret' },
  { slug: 'family', name: '👨‍👩‍👧 Family' },
  { slug: 'money', name: '💸 Money' },
  { slug: 'habits', name: '📱 Habits' },
  { slug: 'social-life', name: '🧍 Social Life' },
  { slug: 'identity', name: '🧬 Identity' },
];

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.glow} />

      <Text style={styles.title}>Choose a category</Text>
      <Text style={styles.subtitle}>Or keep it random with all categories</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.slug}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.replace({
                pathname: '/question',
                params: { category: item.slug },
              })
            }
          >
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090611',
    paddingTop: 84,
    paddingHorizontal: 20,
  },
  glow: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#6f3cff',
    opacity: 0.14,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#bda8ff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  listContent: {
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  card: {
    width: '48%',
    minHeight: 110,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 20, 44, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(120, 100, 180, 0.25)',
  },
  cardText: {
    color: '#f2edff',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
});