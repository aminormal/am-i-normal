import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ensureAnonymousSession, supabase } from '../lib/supabase';

type ResponseRow = {
  id: string;
  answer: boolean;
  question_id: string;
  questions?: {
    categories?: {
      name: string;
      slug: string;
    } | null;
  } | null;
};

type SavedResultRow = {
  id: string;
  question_text: string;
  answer: boolean;
  result_percent: number | null;
  category: string | null;
};

type SubmittedQuestionRow = {
  id: string;
  question_text: string;
  status: string | null;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [savedResults, setSavedResults] = useState<SavedResultRow[]>([]);
  const [submittedQuestions, setSubmittedQuestions] = useState<SubmittedQuestionRow[]>([]);

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
        setSubmittedQuestions([]);
        return;
      }

      const { data: responseData, error: responseError } = await supabase
        .from('responses')
        .select(`
          id,
          answer,
          question_id,
          questions (
            categories (
              name,
              slug
            )
          )
        `)
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

      const { data: submittedData, error: submittedError } = await supabase
        .from('question_submissions')
        .select('id, question_text, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (submittedError) {
        console.log('Profile submitted questions error:', submittedError.message);
      }

      setResponses(responseData ?? []);
      setSavedResults(savedData ?? []);
      setSubmittedQuestions(submittedData ?? []);
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

  async function deleteSubmittedQuestion(id: string) {
    const { error } = await supabase.from('question_submissions').delete().eq('id', id);

    if (error) {
      console.log('Delete submitted question error:', error.message);
      return;
    }

    setSubmittedQuestions((prev) => prev.filter((item) => item.id !== id));
  }

  const totalAnswers = responses.length;
  const yesCount = responses.filter((r) => r.answer === true).length;
  const yesRate = totalAnswers > 0 ? Math.round((yesCount / totalAnswers) * 100) : 0;
  const noRate = totalAnswers > 0 ? 100 - yesRate : 0;

  const yesCategoryCounts: Record<string, number> = {};

  responses.forEach((response) => {
    if (!response.answer) return;
    const categoryName = response.questions?.categories?.name ?? 'Personal';
    yesCategoryCounts[categoryName] = (yesCategoryCounts[categoryName] || 0) + 1;
  });

  const strongestCategory =
    Object.entries(yesCategoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

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

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Quick insight</Text>
        <Text style={styles.insightText}>
          {totalAnswers === 0
            ? 'Answer a few questions to reveal your patterns.'
            : yesRate >= 70
              ? 'You tend to relate to more things than most people admit.'
              : yesRate <= 30
                ? 'You seem more selective about what feels true to you.'
                : "You're pretty balanced — some things hit, some things don't."}
        </Text>
      </View>

      <View style={styles.lockedCard}>
        <Text style={styles.lockedTitle}>🔒 Deep Insights</Text>
        <Text style={styles.lockedText}>
          Unlock your emotional patterns, category breakdowns, and people-like-you comparisons.
        </Text>
        <TouchableOpacity style={styles.unlockButton}>
          <Text style={styles.unlockButtonText}>Unlock insights</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Your strongest category</Text>
        <Text style={styles.insightText}>
          {strongestCategory
            ? `Your strongest pattern right now is ${strongestCategory}.`
            : 'Answer a few more questions to reveal your strongest pattern.'}
        </Text>
      </View>

      <FlatList
        data={savedResults}
        keyExtractor={(item) => `saved-${item.id}`}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Saved results</Text>

            {savedResults.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Nothing saved yet</Text>
                <Text style={styles.emptyText}>Save a result after answering a question.</Text>
              </View>
            ) : null}

            {savedResults.map((item) => (
              <View style={styles.resultCard} key={item.id}>
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
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Submitted questions</Text>

            {submittedQuestions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No submitted questions yet</Text>
                <Text style={styles.emptyText}>Use the + button to submit your own question.</Text>
              </View>
            ) : null}

            {submittedQuestions.map((item) => (
              <View style={styles.resultCard} key={item.id}>
                <Text style={styles.resultCategory}>
                  {item.status ? item.status.toUpperCase() : 'PENDING'}
                </Text>

                <Text style={styles.resultQuestion}>{item.question_text}</Text>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteSubmittedQuestion(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        }
        renderItem={() => null}
        ListFooterComponent={
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
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
    marginBottom: 16,
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
  insightCard: {
    backgroundColor: '#151021',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#241b39',
    marginBottom: 16,
  },
  insightTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  insightText: {
    color: '#c9c0de',
    fontSize: 16,
    lineHeight: 23,
  },
  lockedCard: {
    backgroundColor: '#1d162c',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#3b2c5f',
    marginBottom: 22,
  },
  lockedTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  lockedText: {
    color: '#bda8ff',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  unlockButton: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: '#120d1d',
    fontSize: 16,
    fontWeight: '900',
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
    marginBottom: 12,
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
