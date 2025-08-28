// screens/EditBookForm.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const BASE_URL = 'http://10.201.182.65:3001';

const EditBookForm = ({ route, navigation }) => {
  const { bookId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pickedNewImage, setPickedNewImage] = useState(false);

  const [bookDetails, setBookDetails] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    price: '',
    stock: '',
    coverImage: null,   // for display { uri } or local require
    coverPath: '',      // original server path 'uploads/xyz.jpg'
  });

  // Load existing book
  useEffect(() => {
    const load = async () => {
      try {
        if (!bookId) throw new Error('Missing bookId');
        const res = await fetch(`${BASE_URL}/api/books/${bookId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const imgPath = typeof data.coverImage === 'string' ? data.coverImage.replace(/\\/g, '/') : '';
        const uri = imgPath?.startsWith('http') ? imgPath : `${BASE_URL}/${imgPath}`;

        setBookDetails({
          title: data.title ?? '',
          author: data.author ?? '',
          category: data.category ?? '',
          isbn: data.isbn ?? '',
          price: data.price != null ? String(data.price) : '',
          stock: data.stock != null ? String(data.stock) : '',
          coverImage: uri ? { uri } : null,
          coverPath: imgPath || '',
        });
      } catch (e) {
        Alert.alert('Error', e.message || 'Failed to load book.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId]);

  const handleChange = (key, value) => {
    setBookDetails(prev => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length) {
      setBookDetails(prev => ({
        ...prev,
        coverImage: { uri: result.assets[0].uri },
      }));
      setPickedNewImage(true);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // If user picked a new image, send multipart/form-data
      if (pickedNewImage && bookDetails.coverImage?.uri) {
        const form = new FormData();
        form.append('title', bookDetails.title);
        form.append('author', bookDetails.author);
        form.append('category', bookDetails.category);
        form.append('isbn', bookDetails.isbn);
        form.append('price', String(bookDetails.price || ''));
        form.append('stock', String(bookDetails.stock || '0'));
        form.append('coverImage', {
          uri: bookDetails.coverImage.uri,
          name: 'cover.jpg',
          type: 'image/jpeg',
        });

        const res = await fetch(`${BASE_URL}/api/books/${bookId}`, {
          method: 'PUT',
          body: form, // don't set Content-Type manually
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // No new image: send JSON
        const res = await fetch(`${BASE_URL}/api/books/${bookId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: bookDetails.title,
            author: bookDetails.author,
            category: bookDetails.category,
            isbn: bookDetails.isbn,
            price: Number(bookDetails.price || 0),
            stock: Number(bookDetails.stock || 0),
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }

      Alert.alert('Success', 'Book updated successfully.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update book.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.header}>Edit Book Details</Text>

          {[
            { label: 'Book Name', key: 'title' },
            { label: 'Author Name', key: 'author' },
            { label: 'Category', key: 'category' },
            { label: 'ISBN', key: 'isbn' },
            { label: 'Price (e.g. 374.50)', key: 'price', keyboardType: 'decimal-pad' },
            { label: 'Stock Level', key: 'stock', keyboardType: 'number-pad' },
          ].map(({ label, key, keyboardType }) => (
            <View key={key} style={styles.inputContainer}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={bookDetails[key]}
                onChangeText={(v) => handleChange(key, v)}
                keyboardType={keyboardType || 'default'}
              />
            </View>
          ))}

          <Text style={styles.label}>Upload Cover Page</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
            {bookDetails.coverImage ? (
              <Image source={bookDetails.coverImage} style={styles.coverImage} />
            ) : (
              <Text style={styles.uploadText}>Tap to upload image</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton} disabled={submitting}>
            <Text style={styles.saveButtonText}>{submitting ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center', paddingBottom: 40,
  },
  header: {
    backgroundColor: '#0052cc', color: 'white', fontSize: 20, fontWeight: 'bold',
    width: '100%', textAlign: 'center', paddingVertical: 15, marginBottom: 20, borderRadius: 6,
  },
  inputContainer: { width: '100%', marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 5, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  imageBox: {
    width: '100%', height: 150, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  coverImage: { width: '100%', height: '100%', borderRadius: 6, resizeMode: 'cover' },
  uploadText: { color: '#aaa', fontSize: 14 },
  saveButton: { backgroundColor: '#0052cc', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 6, width: '100%', alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default EditBookForm;
