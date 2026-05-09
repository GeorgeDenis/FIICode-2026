import { useState, useEffect, useCallback } from 'react';
import { safetyService } from '../services/safetyService';
import { errorToast, successToast } from '../utils/toast';

export const useSafety = () => {
  const [contacts, setContacts] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await safetyService.getContacts();
      setContacts(data);
    } catch (e) {
      console.log('Failed to fetch contacts', e);
    }
  }, []);

  const fetchTimer = useCallback(async () => {
    try {
      const data = await safetyService.getActiveTimer();
      setActiveTimer(data);
    } catch (e) {
      if (e.response?.status !== 404) {
        console.log('Failed to fetch timer', e);
      } else {
        setActiveTimer(null);
      }
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchTimer();
  }, [fetchContacts, fetchTimer]);

  const requestContact = async (email) => {
    setLoading(true);
    try {
      await safetyService.requestContact(email);
      successToast('Request sent successfully');
      fetchContacts();
    } catch (e) {
      errorToast(e.response?.data?.detail || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const acceptContact = async (contactId) => {
    setLoading(true);
    try {
      await safetyService.acceptContact(contactId);
      successToast('Contact accepted');
      fetchContacts();
    } catch (e) {
      errorToast('Failed to accept contact');
    } finally {
      setLoading(false);
    }
  };

  const removeContact = async (contactId) => {
    setLoading(true);
    try {
      await safetyService.removeContact(contactId);
      successToast('Contact removed');
      fetchContacts();
    } catch (e) {
      errorToast('Failed to remove contact');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async (durationMinutes, lat, lon) => {
    setLoading(true);
    try {
      const data = await safetyService.startTimer(durationMinutes, lat, lon);
      setActiveTimer(data);
      successToast(`Safety timer started for ${durationMinutes} minutes`);
    } catch (e) {
      errorToast(e.response?.data?.detail || 'Failed to start timer');
    } finally {
      setLoading(false);
    }
  };

  const cancelTimer = async () => {
    setLoading(true);
    try {
      await safetyService.cancelTimer();
      setActiveTimer(null);
      successToast('Safety timer cancelled');
    } catch (e) {
      errorToast('Failed to cancel timer');
    } finally {
      setLoading(false);
    }
  };

  return {
    contacts,
    activeTimer,
    loading,
    requestContact,
    acceptContact,
    removeContact,
    startTimer,
    cancelTimer,
    refreshSafety: () => {
      fetchContacts();
      fetchTimer();
    }
  };
};
