import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ensureAnonymousSession, supabase } from '../lib/supabase';

export default function OnboardingScreen() {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const ages = ['13–17', '18–24', '25–34', '35–44', '45+'];
  const genders = ['Woman', 'Man', 'Other'];

  async function handleStart() {
    const session = await ensureAnonymousSession();
    const user = session?.user;

    if (!user) {
      Alert.alert('User error', 'Could not create your session.');
      return;
    }

    const { error } = await supabase.from('user_profiles').upsert({
      user_id: user.id,
      age_range: selectedAge,
      gender: selectedGender,
    });

    if (error) {
      Alert.alert('Profile save failed', error.message);
      return;
    }

    router.replace('/question');
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroGlow} />

      <Text style={styles.brand}>Am I Normal</Text>
      <Text style={styles.headline}>Answer personal questions.</Text>
      <Text style={styles.subheadline}>See how normal you really are.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>To compare with people like you</Text>

        <Text style={styles.fieldLabel}>Age range</Text>
        <View style={styles.chipWrap}>
          {ages.map((age) => (
            <TouchableOpacity
              key={age}
              style={[styles.chip, selectedAge === age && styles.chipSelected]}
              onPress={() => setSelectedAge(age)}
            >
              <Text style={[styles.chipText, selectedAge === age && styles.chipTextSelected]}>
                {age}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.chipWrap}>
          {genders.map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.chip, selectedGender === gender && styles.chipSelected]}
              onPress={() => setSelectedGender(gender)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedGender === gender && styles.chipTextSelected,
                ]}
              >
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!selectedAge || !selectedGender) && styles.primaryButtonDisabled,
        ]}
        disabled={!selectedAge || !selectedGender}
        onPress={handleStart}
      >
        <Text style={styles.primaryButtonText}>Start playing</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Anonymous. Fast. Slightly uncomfortable.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090611',
    paddingHorizontal: 22,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  heroGlow: {
    position: 'absolute',
    top: 90,
    left: '18%',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#6f3cff',
    opacity: 0.16,
  },
  brand: {
    color: '#bda8ff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  headline: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 18,
  },
  subheadline: {
    color: '#c9c0de',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#151021',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#241b39',
  },
  sectionLabel: {
    color: '#bda8ff',
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'center',
  },
  fieldLabel: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 6,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#21192f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2e2440',
  },
  chipSelected: {
    backgroundColor: '#6f3cff',
    borderColor: '#8e68ff',
  },
  chipText: {
    color: '#e4dfff',
    fontSize: 15,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryButtonDisabled: {
    opacity: 0.35,
  },
  primaryButtonText: {
    color: '#120d1d',
    fontSize: 18,
    fontWeight: '800',
  },
  footerText: {
    color: '#8f87a8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 14,
  },
});
