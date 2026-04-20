import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

type SavedResult = {
  id: string;
  question_text: string;
  answer: boolean;
  result_percent: number | null;
  category: string | null;
};

export default function ProfileScreen() {
  const [items, setItems] = useState<SavedResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedResults();
  }, []);

  async function loadSavedResults() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('saved_results')
      .select('id, question_text, answer, result_percent, category')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Load saved results error:', error.message);
      setLoading(false);
      return;
    }

    setItems(data ?? []);
    setLoading(false);
  }

  async function deleteSavedResult(id: string) {
    await supabase.from('saved_results').delete().eq('id', id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your saved results</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No saved results yet</Text>
          <Text style={styles.emptyText}>Save a result after answering a question.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.category}>{item.category ?? 'Saved'}</Text>
              <Text style={styles.question}>{item.question_text}</Text>
              <Text style={styles.meta}>
                You said {item.answer ? 'YES' : 'NO'} • {item.result_percent ?? 0}% agreed
              </Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteSavedResult(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090611',
    paddingTop: 76,
    paddingHorizontal: 22,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: '#bda8ff',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1328',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2b2140',
  },
  backButtonText: {
    color: '#ece7ff',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: '#9b8fb8',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#151021',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#241b39',
    marginBottom: 14,
  },
  category: {
    color: '#bda8ff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  question: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 25,
    marginBottom: 10,
  },
  meta: {
    color: '#c9c0de',
    fontSize: 15,
    marginBottom: 14,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#241c36',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  deleteButtonText: {
    color: '#f0eaff',
    fontWeight: '700',
  },
});