import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function CreateScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (loading) return;

    if (!text.trim()) {
      Alert.alert('Add a question');
      return;
    }

    if (text.trim().length > 100) {
      Alert.alert('Keep it under 100 characters');
      return;
    }

    let finalText = text.trim();

    if (!finalText.endsWith('?')) {
      finalText += '?';
    }

    try {
      setLoading(true);

      const { error } = await supabase.from('question_submissions').insert({
        question_text: finalText,
        status: 'pending',
      });

      if (error) {
        Alert.alert('Submit failed', error.message);
        return;
      }

      Alert.alert('Submitted ✔');
      setText('');
      router.back();
    } catch (err) {
      Alert.alert('Something went wrong');
      console.log('Create question error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a question</Text>

      <TextInput
        style={styles.input}
        placeholder="Never have I ever..."
        placeholderTextColor="#7d739c"
        multiline
        value={text}
        onChangeText={setText}
      />

      <Text style={styles.helper}>Keep it personal, short, and relatable</Text>

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
    marginBottom: 20,
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
  },
  helper: {
    color: '#9b8fb8',
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#6f3cff',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
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