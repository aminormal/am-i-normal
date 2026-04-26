import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ensureAnonymousSession, supabase } from '../lib/supabase';

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function CreateScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      console.log('Load categories error:', error.message);
      return;
    }

    setCategories(data ?? []);
  }

  async function handleSubmit() {
    if (loading) return;

    if (!text.trim()) {
      Alert.alert('Add a question');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Choose a category');
      return;
    }

    let finalText = text.trim();

    if (!finalText.endsWith('?')) {
      finalText += '?';
    }

    try {
      setLoading(true);

      const session = await ensureAnonymousSession();
      const user = session?.user ?? null;

      if (!user) {
        Alert.alert('User error', 'Could not create your session.');
        return;
      }

      const { error } = await supabase.from('question_submissions').insert({
        user_id: user.id,
        question_text: finalText,
        category_id: selectedCategoryId,
        status: 'pending',
      });

      if (error) {
        Alert.alert('Submit failed', error.message);
        return;
      }

      Alert.alert('Submitted ✔');
      setText('');
      setSelectedCategoryId(null);
      router.back();
    } catch (err) {
      console.log('Create question error:', err);
      Alert.alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a question</Text>
      <Text style={styles.subtitle}>Keep it short, personal, and relatable</Text>

      <TextInput
        style={styles.input}
        placeholder="Have you ever..."
        placeholderTextColor="#7d739c"
        multiline
        value={text}
        onChangeText={setText}
      />

      <Text style={styles.sectionTitle}>Choose a category</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 18 }}
        renderItem={({ item }) => {
          const selected = selectedCategoryId === item.id;

          return (
            <TouchableOpacity
              style={[styles.categoryCard, selected && styles.categoryCardSelected]}
              onPress={() => setSelectedCategoryId(item.id)}
            >
              <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} disabled={loading}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090611',
    paddingTop: 90,
    paddingHorizontal: 22,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9b8fb8',
    marginBottom: 20,
    fontSize: 15,
  },
  input: {
    backgroundColor: '#151021',
    borderRadius: 20,
    padding: 18,
    color: '#fff',
    fontSize: 18,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#241b39',
    textAlignVertical: 'top',
    marginBottom: 22,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryCard: {
    width: '48%',
    minHeight: 72,
    borderRadius: 18,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151021',
    borderWidth: 1,
    borderColor: '#241b39',
  },
  categoryCardSelected: {
    borderColor: '#6f3cff',
    backgroundColor: '#1d1630',
  },
  categoryText: {
    color: '#d8ceff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#6f3cff',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  cancel: {
    color: '#9b8fb8',
    textAlign: 'center',
    marginTop: 20,
  },
});