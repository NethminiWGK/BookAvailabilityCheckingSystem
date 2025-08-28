// screens/AddBooksPage.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const BASE_URL = 'http://10.201.182.65:3001'; // <-- your backend IP:PORT

const AddBooksPage = ({ route, navigation }) => {
  const { ownerId } = route.params || {};

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverImg, setCoverImg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pickCover = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*'],
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.length) {
      setCoverImg(result.assets[0]); // { uri, name, mimeType, size }
    }
  };

  const handleSubmit = async () => {
    if (!ownerId) {
      Alert.alert('Error', 'Missing ownerId to add book under.');
      return;
    }
    if (!title || !author || !price || !category || !isbn) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }
    if (!coverImg) {
      Alert.alert('Validation', 'Please select a cover image.');
      return;
    }

    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('title', title);
      form.append('author', author);
      form.append('price', String(price));   // backend will Number() it
      form.append('stock', String(stock || '0'));
      form.append('category', category);
      form.append('isbn', isbn);

      form.append('coverImage', {
        uri: coverImg.uri,
        name: coverImg.name || 'cover.jpg',
        type: coverImg.mimeType || 'image/jpeg',
      });

      const res = await fetch(`${BASE_URL}/api/owners/${ownerId}/books`, {
        method: 'POST',
        body: form, // DO NOT set Content-Type manually; let fetch set the boundary
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      Alert.alert('Success', 'Book added successfully!');
      // reset
      setTitle('');
      setAuthor('');
      setPrice('');
      setStock('');
      setCategory('');
      setIsbn('');
      setCoverImg(null);

      // navigate back or to list
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add book.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add Book</Text>

      <TextInput
        style={styles.input}
        placeholder="Title *"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Author *"
        value={author}
        onChangeText={setAuthor}
      />
      <TextInput
        style={styles.input}
        placeholder="Price (e.g. 374.50) *"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Stock (e.g. 10)"
        value={stock}
        onChangeText={setStock}
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Category *"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="ISBN *"
        value={isbn}
        onChangeText={setIsbn}
      />

      <TouchableOpacity style={styles.input} onPress={pickCover}>
        <Text>{coverImg ? `📄 ${coverImg.name}` : 'Pick Cover Image *'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Submitting…' : 'Submit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    fontSize: 24, fontWeight: 'bold', color: '#003366',
    marginBottom: 20, textAlign: 'center',
  },
  input: {
    height: 50, borderColor: '#ccc', borderWidth: 1,
    borderRadius: 5, marginBottom: 15, paddingLeft: 10,
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#003366', padding: 15, borderRadius: 5, alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: 'bold' },
});

export default AddBooksPage;