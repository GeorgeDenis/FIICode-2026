import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DocumentService from '../../services/documentService';
import { errorToast } from '../../utils/toast';

const ClaimantActionCard = ({ doc, claimant, theme, handleChatNavigation, onRefresh }) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const handleRejectClaim = () => {
    Alert.alert('Reject Claim', 'Are you sure this is not the real owner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setIsRejecting(true);
          try {
            await DocumentService.rejectClaim(doc.id);
            onRefresh?.();
          } catch (e) {
            errorToast('Failed to reject claim');
          } finally {
            setIsRejecting(false);
          }
        },
      },
    ]);
  };

  const handleConfirmReturn = () => {
    Alert.alert('Confirm Return', 'Have you returned the document to this person?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setIsConfirming(true);
          try {
            await DocumentService.markDocumentReturned(doc.id);
            onRefresh?.();
          } catch (e) {
            errorToast('Failed to confirm return');
          } finally {
            setIsConfirming(false);
          }
        },
      },
    ]);
  };

  return (
    <View className="border-t border-border bg-surface-50/50 px-4 pb-4 pt-3 dark:bg-orange-950/20">
      <Text className="mb-2 text-xs font-bold text-orange-600 dark:text-orange-400">
        PENDING CLAIM
      </Text>
      {claimant ? (
        <View className="mb-3 flex-row items-center gap-2">
          <Ionicons name="person-circle" size={36} color={theme.iconColor} />
          <View>
            <Text className="text-foreground font-bold">
              {claimant.first_name} {claimant.last_name}
            </Text>
            <Text className="text-foreground text-xs opacity-60">Claims this is theirs</Text>
          </View>
        </View>
      ) : (
        <ActivityIndicator size="small" className="mb-3" />
      )}

      <Pressable
        onPress={() => handleChatNavigation(claimant)}
        className="bg-primary/10 mb-3 flex-row items-center justify-center gap-2 rounded-xl py-2.5">
        <Ionicons name="chatbubble-outline" size={16} color={theme.tabIconSelected} />
        <Text className="font-bold text-primary">Chat with Claimant</Text>
      </Pressable>

      <View className="flex-row gap-2">
        <Pressable
          onPress={handleRejectClaim}
          disabled={isRejecting || isConfirming}
          className="flex-1 items-center justify-center rounded-xl bg-red-100 py-3 dark:bg-red-900/30">
          {isRejecting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Text className="font-bold text-red-600 dark:text-red-400">Reject</Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleConfirmReturn}
          disabled={isRejecting || isConfirming}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-green-500 py-3">
          {isConfirming ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="white" />
              <Text className="font-bold text-white">Confirm Return</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default ClaimantActionCard;
