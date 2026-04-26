import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ensureAnonymousSession, supabase } from '../lib/supabase';

export default function ResultScreen() {
  const { questionId, questionText, answer, category, seen, streak } =
    useLocalSearchParams<{
      questionId?: string;
      questionText?: string;
      answer?: string;
      category?: string;
      seen?: string;
      streak?: string;
    }>();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [percentYes, setPercentYes] = useState<number | null>(null);

  const saidYes = answer === 'yes';
  const displayedPercent =
    percentYes === null ? null : saidYes ? percentYes : 100 - percentYes;

  useEffect(() => {
    async function loadResults() {
      if (!questionId) {
        setPercentYes(50);
        return;
      }

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
      setPercentYes(Math.round((yesCount / data.length) * 100));
    }

    loadResults();
  }, [questionId]);

  const couchReaction = useMemo(() => {
    if (displayedPercent === null) return 'Checking the room...';

    const lines = {
      rare: [
        "Okay… you're definitely built different.",
        "I don't even know what to say to that.",
        'You might be the main character.',
        "This one's… concerning. In a fun way.",
      ],
      chaos: [
        'You and your small crew… I see you.',
        'Not common, but not alone either.',
        'This is a very specific vibe.',
        "You've got your own lane, clearly.",
      ],
      middle: [
        "This one's pretty split, honestly.",
        'Half the room agrees with you.',
        'No clear winner here.',
        "You're right in the middle of the chaos.",
      ],
      majority: [
        'Yeah… a lot of people are with you on this.',
        "We're all a little guilty here.",
        'This one hits more people than expected.',
        'Not proud of it, but yeah.',
      ],
      universal: [
        'Yeah… basically everyone.',
        "If you said no, I don't believe you.",
        'This is just human at this point.',
        "We all do this. It's fine.",
      ],
    };

    let bucket: keyof typeof lines = 'middle';

    if (displayedPercent <= 20) bucket = 'rare';
    else if (displayedPercent <= 40) bucket = 'chaos';
    else if (displayedPercent <= 60) bucket = 'middle';
    else if (displayedPercent <= 80) bucket = 'majority';
    else bucket = 'universal';

    const bucketLines = lines[bucket];
    return bucketLines[Math.floor(Math.random() * bucketLines.length)];
  }, [displayedPercent]);

  async function handleSaveResult() {
    if (saving || saved) return;

    if (!questionText || !questionId) {
      Alert.alert('Save failed', 'Missing result details.');
      return;
    }

    setSaving(true);

    const session = await ensureAnonymousSession();
    const user = session?.user ?? null;

    if (!user) {
      setSaving(false);
      Alert.alert('Not ready yet', 'Could not find your session.');
      return;
    }

    const { error } = await supabase.from('saved_results').insert({
      user_id: user.id,
      question_id: questionId,
      question_text: questionText,
      answer: saidYes,
      result_percent: displayedPercent,
      category: category ?? null,
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
      <View style={styles.glow} pointerEvents="none" />

      <Text style={styles.youSaid}>
        You said <Text style={styles.youSaidStrong}>{saidYes ? 'YES' : 'NO'}</Text>
      </Text>

      <Text style={styles.questionText}>{questionText ?? 'Question'}</Text>

      <View style={styles.resultCard}>
        <Text style={styles.percent}>
          {displayedPercent === null ? '...' : `${displayedPercent}%`}
        </Text>

        <Text style={styles.percentLabel}>
          of people answered {saidYes ? 'YES' : 'NO'}
        </Text>

        <Text style={styles.compareText}>{couchReaction}</Text>

        <View style={styles.segmentCard}>
          <Text style={styles.segmentTitle}>See how people like you answered</Text>

          <View style={styles.segmentRow}>
            <Text style={styles.segmentBlur}>Women: locked</Text>
          </View>

          <View style={styles.segmentRow}>
            <Text style={styles.segmentBlur}>Your age group: locked</Text>
          </View>

          <TouchableOpacity style={styles.unlockButton}>
            <Text style={styles.unlockButtonText}>Unlock age + gender</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionStack}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() =>
            router.replace({
              pathname: '/question',
              params: {
                category: category ?? 'all',
                seen: seen ?? '[]',
                streak: streak ?? '0',
              },
            })
          }
        >
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
  compareText: {
    color: '#bda8ff',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 22,
    textAlign: 'center',
    fontWeight: '700',
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
