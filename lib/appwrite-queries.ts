import { databases, DATABASE_ID, DOCTORS_COLLECTION_ID, TIME_SLOTS_COLLECTION_ID, USERS_COLLECTION_ID, ID } from './appwrite';
import { Query } from 'appwrite';

// ============ DOCTORS QUERIES ============

interface Doctor {
  $id: string;
  name: string;
  specialty: string;
  hourlyRate: number;
  image?: string;
  experience?: string;
  specialties?: string;
  createdAt: string;
  updatedAt: string;
}

interface TimeSlot {
  $id: string;
  doctorId: string;
  time: string;
  available: boolean;
  status: string;
  label: string;
  date: string;
}

interface User {
  $id: string;
  email: string;
  name: string;
  role?: string;
  phone?: string;
  createdAt: string;
}

// Create Doctor
export async function createDoctor(data: Omit<Doctor, '$id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString();
    const response = await databases.createDocument(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        specialties: typeof data.specialties === 'string' ? data.specialties : JSON.stringify(data.specialties || []),
        createdAt: now,
        updatedAt: now,
      }
    );
    return response as Doctor;
  } catch (error) {
    console.error('Error creating doctor:', error);
    throw error;
  }
}

// Get Doctors with pagination and filtering
export async function getDoctors(
  limit = 10,
  offset = 0,
  specialty?: string,
  search?: string
) {
  try {
    const queries = [];

    if (specialty) {
      queries.push(Query.equal('specialty', specialty));
    }

    if (search) {
      queries.push(Query.search('name', search));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [
        ...queries,
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('createdAt'),
      ]
    );

    return response as unknown as { documents: Doctor[]; total: number };
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
}

// Get Single Doctor
export async function getDoctor(doctorId: string) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      doctorId
    );
    return response as Doctor;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw error;
  }
}

// Update Doctor
export async function updateDoctor(doctorId: string, data: Partial<Omit<Doctor, '$id' | 'createdAt'>>) {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      doctorId,
      {
        ...data,
        specialties: typeof data.specialties === 'string' ? data.specialties : JSON.stringify(data.specialties || []),
        updatedAt: new Date().toISOString(),
      }
    );
    return response as Doctor;
  } catch (error) {
    console.error('Error updating doctor:', error);
    throw error;
  }
}

// Delete Doctor
export async function deleteDoctor(doctorId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      doctorId
    );
  } catch (error) {
    console.error('Error deleting doctor:', error);
    throw error;
  }
}

// Get all specialties (unique values)
export async function getSpecialties() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [Query.limit(1000)]
    );

    const specialties = new Set<string>();
    (response.documents as Doctor[]).forEach((doc) => {
      if (doc.specialty) {
        specialties.add(doc.specialty);
      }
    });

    return Array.from(specialties).sort();
  } catch (error) {
    console.error('Error fetching specialties:', error);
    throw error;
  }
}

// ============ TIME SLOTS QUERIES ============

// Create Time Slot
export async function createTimeSlot(data: Omit<TimeSlot, '$id'>) {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      TIME_SLOTS_COLLECTION_ID,
      ID.unique(),
      data
    );
    return response as TimeSlot;
  } catch (error) {
    console.error('Error creating time slot:', error);
    throw error;
  }
}

// Create multiple time slots (for batch insert)
export async function createMultipleTimeSlots(slots: Omit<TimeSlot, '$id'>[]) {
  try {
    const responses = await Promise.all(
      slots.map((slot) =>
        databases.createDocument(
          DATABASE_ID,
          TIME_SLOTS_COLLECTION_ID,
          ID.unique(),
          slot
        )
      )
    );
    return responses as TimeSlot[];
  } catch (error) {
    console.error('Error creating time slots:', error);
    throw error;
  }
}

// Get Time Slots for a Doctor
export async function getTimeSlotsByDoctor(doctorId: string, date?: string) {
  try {
    const queries = [Query.equal('doctorId', doctorId)];

    if (date) {
      queries.push(Query.equal('date', date));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      TIME_SLOTS_COLLECTION_ID,
      [...queries, Query.orderAsc('time')]
    );

    return response as unknown as { documents: TimeSlot[]; total: number };
  } catch (error) {
    console.error('Error fetching time slots:', error);
    throw error;
  }
}

// Update Time Slot
export async function updateTimeSlot(slotId: string, data: Partial<TimeSlot>) {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      TIME_SLOTS_COLLECTION_ID,
      slotId,
      data
    );
    return response as TimeSlot;
  } catch (error) {
    console.error('Error updating time slot:', error);
    throw error;
  }
}

// Delete Time Slot
export async function deleteTimeSlot(slotId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      TIME_SLOTS_COLLECTION_ID,
      slotId
    );
  } catch (error) {
    console.error('Error deleting time slot:', error);
    throw error;
  }
}

// Delete multiple time slots by doctor
export async function deleteTimeSlotsByDoctor(doctorId: string) {
  try {
    const slots = await getTimeSlotsByDoctor(doctorId);
    await Promise.all(
      slots.documents.map((slot) => deleteTimeSlot(slot.$id))
    );
  } catch (error) {
    console.error('Error deleting time slots by doctor:', error);
    throw error;
  }
}

// ============ USERS QUERIES ============

// Create User
export async function createUser(data: Omit<User, '$id' | 'createdAt'>) {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        createdAt: new Date().toISOString(),
      }
    );
    return response as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Get Users with pagination
export async function getUsers(limit = 10, offset = 0, search?: string) {
  try {
    const queries = [];

    if (search) {
      queries.push(Query.search('name', search));
      queries.push(Query.search('email', search));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [
        ...queries,
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('createdAt'),
      ]
    );

    return response as unknown as { documents: User[]; total: number };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Get Single User
export async function getUser(userId: string) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );
    return response as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Update User
export async function updateUser(userId: string, data: Partial<Omit<User, '$id' | 'createdAt'>>) {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      data
    );
    return response as User;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete User
export async function deleteUser(userId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
