import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ResultScreen() {
  const { questionId, questionText, answer } = useLocalSearchParams<{
    questionId: string;
    questionText: string;
    answer: string;
  }>();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

 const saidYes = answer === 'yes';
const [percentYes, setPercentYes] = useState<number | null>(null);
const emotionalLine =
  percentYes === null
    ? 'Loading...'
    : saidYes
      ? percentYes >= 50
        ? "You're not alone."
        : 'Less common…'
      : 100 - percentYes >= 50
        ? "You're not alone."
        : 'Less common…';

useEffect(() => {
  async function loadResults() {
    const { data, error } = await supabase
      .from('responses')
      .select('answer')
      .eq('question_id', questionId);

    if (error) {
      console.log('Load results error:', error.message);
      setPercentYes(50);
      return;
    }

    if (!data || data.length === 0) {
      setPercentYes(50);
      return;
    }

    const yesCount = data.filter((r) => r.answer === true).length;
    const calculatedPercentYes = Math.round((yesCount / data.length) * 100);

    setPercentYes(calculatedPercentYes);
  }

  loadResults();
}, [questionId]);

  async function handleSaveResult() {
    if (saving || saved) return;

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      Alert.alert('Not ready yet', 'Could not find your session.');
      return;
    }

    const { error } = await supabase.from('saved_results').insert({
      user_id: user.id,
      question_id: questionId ?? null,
      question_text: questionText ?? '',
      answer: saidYes,
      result_percent: percent,
      category: 'Crushes & Relationships',
    });

    setSaving(false);

    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }

    setSaved(true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.glow} />

      <Text style={styles.youSaid}>
        You said <Text style={styles.youSaidStrong}>{saidYes ? 'YES' : 'NO'}</Text>
      </Text>

      <Text style={styles.questionText}>{questionText}</Text>

      <View style={styles.resultCard}>
       <Text style={styles.percent}>
  {percentYes === null ? '...' : `${saidYes ? percentYes : 100 - percentYes}%`}
</Text>
        <Text style={styles.percentLabel}>of people answered {saidYes ? 'YES' : 'NO'}</Text>
        <Text style={styles.emotionalLine}>{emotionalLine}</Text>

        <View style={styles.segmentCard}>
          <Text style={styles.segmentTitle}>See how people like you answered</Text>

          <View style={styles.segmentRow}>
            <Text style={styles.segmentBlur}>Women: 82%</Text>
          </View>
          <View style={styles.segmentRow}>
            <Text style={styles.segmentBlur}>18–24: 85%</Text>
          </View>

          <TouchableOpacity style={styles.unlockButton}>
            <Text style={styles.unlockButtonText}>Unlock age + gender</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionStack}>
        <TouchableOpacity style={styles.nextButton} onPress={() => router.replace('/question')}>
          <Text style={styles.nextButtonText}>Next question</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleSaveResult}
          disabled={saving || saved}
        >
          <Text style={styles.shareButtonText}>
            {saved ? 'Saved ✔' : saving ? 'Saving...' : 'Save result'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostButton} onPress={() => router.push('/profile')}>
          <Text style={styles.ghostButtonText}>View profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090611',
    paddingHorizontal: 22,
    paddingTop: 76,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  glow: {
    position: 'absolute',
    top: 150,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#6f3cff',
    opacity: 0.14,
  },
  youSaid: {
    color: '#c6bddb',
    textAlign: 'center',
    fontSize: 16,
  },
  youSaidStrong: {
    color: '#ffffff',
    fontWeight: '800',
  },
  questionText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    textAlign: 'center',
    marginTop: 10,
  },
  resultCard: {
    backgroundColor: '#151021',
    borderRadius: 32,
    paddingVertical: 34,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#241b39',
  },
  percent: {
    color: '#ffffff',
    fontSize: 72,
    fontWeight: '900',
    textAlign: 'center',
  },
  percentLabel: {
    color: '#c9c0de',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  emotionalLine: {
    color: '#bda8ff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  segmentCard: {
    backgroundColor: '#1d162c',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2d2341',
  },
  segmentTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  segmentRow: {
    backgroundColor: '#241c36',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  segmentBlur: {
    color: '#9b8fb8',
    fontSize: 15,
    textAlign: 'center',
  },
  unlockButton: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 15,
    marginTop: 8,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: '#120d1d',
    fontSize: 16,
    fontWeight: '800',
  },
  actionStack: {
    gap: 12,
  },
  nextButton: {
    backgroundColor: '#6f3cff',
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  shareButton: {
    backgroundColor: '#1a1328',
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2b2140',
  },
  shareButtonText: {
    color: '#ece7ff',
    fontSize: 17,
    fontWeight: '800',
  },
  ghostButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#9b8fb8',
    fontSize: 15,
    fontWeight: '700',
  },
});