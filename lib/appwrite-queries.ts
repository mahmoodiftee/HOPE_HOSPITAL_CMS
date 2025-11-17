import {
  databases,
  DATABASE_ID,
  DOCTORS_COLLECTION_ID,
  TIME_SLOTS_COLLECTION_ID,
  USERS_COLLECTION_ID,
  ID,
} from "./appwrite";
import { Query } from "appwrite";
import type { Models } from "appwrite";

interface TimeSlot extends Models.Document {
  doctorId: string;
  availableDays?: string[];
  availableTimes?: string[];
}

interface Doctor extends Models.Document {
  name: string;
  specialty: string;
  hourlyRate: number;
  image?: string;
  experience?: string;
  specialties?: string[];
}

interface User extends Models.Document {
  email: string;
  name: string;
  role?: string;
  phone?: string;
}

export async function createDoctor(data: Omit<Doctor, keyof Models.Document>) {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        specialties: data.specialties || [],
      }
    );
    return response;
  } catch (error) {
    console.error("Error creating doctor:", error);
    throw error;
  }
}

export async function getDoctors(
  limit = 10,
  offset = 0,
  specialty?: string,
  search?: string
) {
  try {
    const queries = [];

    if (specialty) {
      queries.push(Query.equal("specialty", specialty));
    }

    if (search) {
      queries.push(Query.search("name", search));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [
        ...queries,
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt"),
      ]
    );

    return {
      documents: response.documents,
      total: response.total,
    };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
}

export async function getDoctor(doctorId: string) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      doctorId
    );
    return response;
  } catch (error) {
    console.error("Error fetching doctor:", error);
    throw error;
  }
}

export async function updateDoctor(
  doctorId: string,
  data: Partial<Omit<Doctor, keyof Models.Document>>
) {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      doctorId,
      {
        ...data,
        ...(data.specialties && { specialties: data.specialties }),
      }
    );
    return response;
  } catch (error) {
    console.error("Error updating doctor:", error);
    throw error;
  }
}

export async function deleteDoctor(doctorId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      doctorId
    );
  } catch (error) {
    console.error("Error deleting doctor:", error);
    throw error;
  }
}

export async function getSpecialties() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [Query.limit(1000)]
    );

    const specialties = new Set<string>();
    response.documents.forEach((doc) => {
      if (doc.specialty) {
        specialties.add(doc.specialty);
      }
    });

    return Array.from(specialties).sort();
  } catch (error) {
    console.error("Error fetching specialties:", error);
    throw error;
  }
}

// ============ TIME SLOTS QUERIES ============

export async function createTimeSlot(
  data: Omit<TimeSlot, keyof Models.Document>
) {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      TIME_SLOTS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        availableDays: data.availableDays || [],
        availableTimes: data.availableTimes || [],
      }
    );
    return response;
  } catch (error) {
    console.error("Error creating time slot:", error);
    throw error;
  }
}

export async function getTimeSlots(limit = 10, offset = 0, doctorId?: string) {
  try {
    const queries = [];

    if (doctorId) {
      queries.push(Query.equal("doctorId", doctorId));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      TIME_SLOTS_COLLECTION_ID,
      [
        ...queries,
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt"),
      ]
    );

    return {
      documents: response.documents,
      total: response.total,
    };
  } catch (error) {
    console.error("Error fetching time slots:", error);
    throw error;
  }
}

export async function getTimeSlot(timeSlotId: string) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      TIME_SLOTS_COLLECTION_ID,
      timeSlotId
    );
    return response;
  } catch (error) {
    console.error("Error fetching time slot:", error);
    throw error;
  }
}

export async function updateTimeSlot(
  timeSlotId: string,
  data: Partial<Omit<TimeSlot, keyof Models.Document>>
) {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      TIME_SLOTS_COLLECTION_ID,
      timeSlotId,
      {
        ...data,
        ...(data.availableDays && { availableDays: data.availableDays }),
        ...(data.availableTimes && { availableTimes: data.availableTimes }),
      }
    );
    return response;
  } catch (error) {
    console.error("Error updating time slot:", error);
    throw error;
  }
}

export async function deleteTimeSlot(timeSlotId: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      TIME_SLOTS_COLLECTION_ID,
      timeSlotId
    );
  } catch (error) {
    console.error("Error deleting time slot:", error);
    throw error;
  }
}

export async function getDoctorsWithoutTimeSlots() {
  try {
    const doctorsResponse = await databases.listDocuments(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [Query.limit(1000)]
    );

    const timeSlotsResponse = await databases.listDocuments(
      DATABASE_ID,
      TIME_SLOTS_COLLECTION_ID,
      [Query.limit(1000)]
    );

    const doctorIdsWithSlots = new Set(
      timeSlotsResponse.documents.map((slot) => slot.doctorId)
    );

    const doctorsWithoutSlots = doctorsResponse.documents.filter(
      (doctor) => !doctorIdsWithSlots.has(doctor.$id)
    );

    return doctorsWithoutSlots;
  } catch (error) {
    console.error("Error fetching doctors without time slots:", error);
    throw error;
  }
}

// ============ USERS QUERIES ============

export async function createUser(data: Omit<User, keyof Models.Document>) {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      data
    );
    return response as User;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUsers(limit = 10, offset = 0, search?: string) {
  try {
    const queries = [];

    if (search) {
      queries.push(Query.search("name", search));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [
        ...queries,
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt"),
      ]
    );

    return {
      documents: response.documents,
      total: response.total,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getUser(userId: string) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );
    return response;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<User, keyof Models.Document>>
) {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      data
    );
    return response as User;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export type { Doctor, TimeSlot, User };
