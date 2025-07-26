import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './config';

export interface Project {
  id?: string;
  userId: string;
  name: string;
  location: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  thumbnail?: string;
  geometry?: {
    type: 'polygon' | 'rectangle' | 'circle' | 'point';
    coordinates: number[][];
    bounds?: google.maps.LatLngBounds;
  };
  analysis?: {
    runoffScore: number;
    noiseScore: number;
    climateScore: number;
    walkabilityScore: number;
    compositeScore: number;
    weights: {
      runoff: number;
      noise: number;
      climate: number;
      walkability: number;
    };
  };
}

const PROJECTS_COLLECTION = 'projects';

export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...projectData,
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserProjects = async (userId: string) => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project);
    });
    return { projects, error: null };
  } catch (error: any) {
    return { projects: [], error: error.message };
  }
};

export const getProject = async (projectId: string) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { 
        project: { id: docSnap.id, ...docSnap.data() } as Project, 
        error: null 
      };
    } else {
      return { project: null, error: 'Project not found' };
    }
  } catch (error: any) {
    return { project: null, error: error.message };
  }
};