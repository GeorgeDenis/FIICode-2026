import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { errorToast, successToast } from '../../../utils/toast';
import DocumentService from '../../../services/documentService';
import DocumentManagementCard from './DocumentManagementCard';

const DocumentsDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = async () => {
    try {
      const data = await DocumentService.getAllDocumentsForAdmin();
      setDocuments(data);
      setFilteredDocuments(data);
    } catch (error) {
      errorToast('Failed to fetch documents: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocuments(documents);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = documents.filter((doc) => {
        const fullName = `${doc.ai_first_name || ''} ${doc.ai_last_name || ''}`.toLowerCase();
        const city = (doc.ai_issuing_city || '').toLowerCase();
        return fullName.includes(lowerQuery) || city.includes(lowerQuery) || doc.doc_type.toLowerCase().includes(lowerQuery);
      });
      setFilteredDocuments(filtered);
    }
  }, [searchQuery, documents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocuments();
  }, []);

  const handleDeleteDocument = async (docId) => {
    try {
      await DocumentService.deleteDocument(docId);
      successToast('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      errorToast('Failed to delete document: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleUpdateStatus = async (docId, newStatus) => {
    try {
      await DocumentService.updateDocumentStatus(docId, newStatus);
      successToast(`Document status updated to ${newStatus}`);
      fetchDocuments();
    } catch (error) {
      errorToast('Failed to update status: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-slate-500">Loading documents...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      <View className="px-4 pt-4 mb-3">
        <View className="flex-row items-center rounded-2xl bg-white px-4 py-2 shadow-sm dark:bg-slate-900">
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            className="ml-2 flex-1 text-base text-slate-800 dark:text-slate-100"
            placeholder="Search docs by name, city, or type..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <Ionicons
              name="close-circle"
              size={20}
              color="#94A3B8"
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>

      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentManagementCard
            doc={item}
            onDelete={handleDeleteDocument}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center pt-20">
            <Ionicons name="document-outline" size={80} color="#CBD5E1" />
            <Text className="mt-4 text-xl font-medium text-slate-400">No documents found</Text>
          </View>
        }
      />
    </View>
  );
};

export default DocumentsDashboard;
