import { Timestamp } from 'firebase/firestore';

/**
 * Format a Firestore timestamp to a localized date string
 */
export const formatFirestoreDate = (timestamp: Timestamp | null | undefined): string => {
  if (!timestamp || !timestamp.seconds) {
    return 'N/A';
  }
  return new Date(timestamp.seconds * 1000).toLocaleDateString();
};

/**
 * Format a Firestore timestamp to a localized date and time string
 */
export const formatFirestoreDateTime = (timestamp: Timestamp | null | undefined): string => {
  if (!timestamp || !timestamp.seconds) {
    return 'N/A';
  }
  return new Date(timestamp.seconds * 1000).toLocaleString();
};

/**
 * Format a regular Date object to a localized date string
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) {
    return 'N/A';
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

/**
 * Format a regular Date object to a localized date and time string
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) {
    return 'N/A';
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString();
};