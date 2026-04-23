import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ensureAnonymousSession, supabase } from '../lib/supabase';

type ResponseRow = {
  id: string;
  answer: boolean;
  question_id: string;
};

type SavedResultRow = {
  id: string;
  question_text: string;
  answer: boolean;
  result_percent: number | null;
  category: string | null;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [savedResults, setSavedResults] = useState<SavedResultRow[]>([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  async function loadProfileData() {
    try {
      setLoading(true);

      const session = await ensureAnonymousSession();
      const user = session?.user ?? null;

      if (!user) {
        setResponses([]);
        setSavedResults([]);
        return;
      }

      const { data: responseData, error: responseError } = await supabase
        .from('responses')
        .select('id, answer, question_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (responseError) {
        console.log('Profile responses error:', responseError.message);
      }

      const { data: savedData, error: savedError } = await supabase
        .from('saved_results')
        .select('id, question_text, answer, result_percent, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (savedError) {
        console.log('Profile saved results error:', savedError.message);
      }

      setResponses(responseData ?? []);
      setSavedResults(savedData ?? []);
    } catch (err) {
      console.log('Profile load unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteSavedResult(id: string) {
    const { error } = await supabase.from('saved_results').delete().eq('id', id);

    if (error) {
      console.log('Delete saved result error:', error.message);
      return;
    }

    setSavedResults((prev) => prev.filter((item) => item.id !== id));
  }

  const totalAnswers = responses.length;
  const yesCount = responses.filter((r) => r.answer === true).length;
  const yesRate = totalAnswers > 0 ? Math.round((yesCount / totalAnswers) * 100) : 0;
  const noRate = totalAnswers > 0 ? 100 - yesRate : 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your patterns so far</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalAnswers}</Text>
          <Text style={styles.statLabel}>Total answers</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{yesRate}%</Text>
          <Text style={styles.statLabel}>You say YES</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{noRate}%</Text>
          <Text style={styles.statLabel}>You say NO</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{savedResults.length}</Text>
          <Text style={styles.statLabel}>Saved results</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Saved results</Text>

      {savedResults.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyText}>Save a result after answering a question.</Text>
        </View>
      ) : (
        <FlatList
          data={savedResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.resultCard}>
              <Text style={styles.resultCategory}>
                {item.category ? item.category : 'Saved'}
              </Text>

              <Text style={styles.resultQuestion}>{item.question_text}</Text>

              <Text style={styles.resultMeta}>
                You said {item.answer ? 'YES' : 'NO'}
                {item.result_percent !== null ? ` • ${item.result_percent}% agreed` : ''}
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

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
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
  center: {
    flex: 1,
    backgroundColor: '#090611',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: '#bda8ff',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#151021',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#241b39',
    marginBottom: 14,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  },
  statLabel: {
    color: '#bda8ff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: '#151021',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#241b39',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    color: '#9b8fb8',
    fontSize: 15,
    lineHeight: 21,
  },
  resultCard: {
    backgroundColor: '#151021',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#241b39',
    marginBottom: 12,
  },
  resultCategory: {
    color: '#bda8ff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultQuestion: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  resultMeta: {
    color: '#c9c0de',
    fontSize: 15,
    marginBottom: 12,
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
  backButton: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#6f3cff',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
});