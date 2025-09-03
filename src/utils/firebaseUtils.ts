import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  Query,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Generic utility functions for Firestore operations

/**
 * Get all documents from a collection
 */
export const getAllDocuments = async <T>(
  collectionName: string,
  orderByField?: string
): Promise<T[]> => {
  try {
    console.log(`🔍 Fetching documents from collection: ${collectionName}`);
    let q;
    if (orderByField) {
      q = query(collection(db, collectionName), orderBy(orderByField));
      console.log(`📋 Using orderBy: ${orderByField}`);
    } else {
      q = collection(db, collectionName);
    }
    
    const querySnapshot = await getDocs(q);
    console.log(`📊 Query snapshot size: ${querySnapshot.size}`);
    const documents: T[] = [];
    querySnapshot.forEach((doc) => {
      console.log(`📄 Document ID: ${doc.id}`, doc.data());
      documents.push({ id: doc.id, ...doc.data() } as T);
    });
    console.log(`✅ Successfully fetched ${documents.length} documents from ${collectionName}`);
    return documents;
  } catch (error) {
    console.error(`❌ Error getting ${collectionName}:`, error);
    return [];
  }
};

/**
 * Get documents from a collection with a query
 */
export const getDocumentsWithQuery = async <T>(
  collectionName: string,
  queryConstraints: any[]
): Promise<T[]> => {
  try {
    console.log(`🔍 Fetching documents from collection: ${collectionName} with query constraints`);
    const q = query(collection(db, collectionName), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    console.log(`📊 Query snapshot size: ${querySnapshot.size}`);
    const documents: T[] = [];
    querySnapshot.forEach((doc) => {
      console.log(`📄 Document ID: ${doc.id}`, doc.data());
      documents.push({ id: doc.id, ...doc.data() } as T);
    });
    console.log(`✅ Successfully fetched ${documents.length} documents from ${collectionName} with query`);
    return documents;
  } catch (error) {
    console.error(`❌ Error getting ${collectionName} with query:`, error);
    return [];
  }
};

/**
 * Get a single document by ID
 */
export const getDocumentById = async <T>(
  collectionName: string,
  documentId: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting ${collectionName} document:`, error);
    return null;
  }
};

/**
 * Add a new document to a collection
 */
export const addDocument = async <T>(
  collectionName: string,
  data: Omit<T, 'id'>,
  includeTimestamp: boolean = true
): Promise<string | null> => {
  try {
    const documentData = includeTimestamp 
      ? { ...data, createdAt: Timestamp.now() }
      : data;
    
    const docRef = await addDoc(collection(db, collectionName), documentData);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding ${collectionName} document:`, error);
    return null;
  }
};

/**
 * Update a document in a collection
 */
export const updateDocument = async <T>(
  collectionName: string,
  documentId: string,
  data: Partial<T>,
  includeUpdatedTimestamp: boolean = false
): Promise<boolean> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const updateData = includeUpdatedTimestamp 
      ? { ...data, updatedAt: Timestamp.now() }
      : data;
    
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error(`Error updating ${collectionName} document:`, error);
    return false;
  }
};

/**
 * Delete a document from a collection
 */
export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, collectionName, documentId));
    return true;
  } catch (error) {
    console.error(`Error deleting ${collectionName} document:`, error);
    return false;
  }
};

/**
 * Get a single document by field value
 */
export const getDocumentByField = async <T>(
  collectionName: string,
  fieldName: string,
  fieldValue: any
): Promise<T | null> => {
  try {
    const q = query(collection(db, collectionName), where(fieldName, '==', fieldValue));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting ${collectionName} document by ${fieldName}:`, error);
    return null;
  }
};