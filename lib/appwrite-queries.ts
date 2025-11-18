import {
  databases,
  DATABASE_ID,
  DOCTORS_COLLECTION_ID,
  TIME_SLOTS_COLLECTION_ID,
  USERS_COLLECTION_ID,
  ID,
  TIME_SLOTS_ID,
} from "./appwrite";
import { Query } from "appwrite";
import type { Models } from "appwrite";

interface TimeSlot extends Models.Document {
  docId: string;
  day?: string;
  time?: string[];
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
      TIME_SLOTS_ID,
      ID.unique(),
      {
        docId: data.docId,
        day: data.day,
        time: data.time || [],
      }
    );
    return response;
  } catch (error) {
    console.error("Error creating time slot:", error);
    throw error;
  }
}

export async function getTimeSlotsWithDoctors(limit = 10, offset = 0) {
  try {
    const timeSlotsResponse = await databases.listDocuments(
      DATABASE_ID,
      TIME_SLOTS_ID,
      [
        Query.limit(1000),
        Query.orderDesc("$createdAt"),
      ]
    );

    const groupedByDoctor = timeSlotsResponse.documents.reduce((acc: any, slot: any) => {
      const docId = slot.docId;
      if (!acc[docId]) {
        acc[docId] = [];
      }
      acc[docId].push({
        $id: slot.$id,
        day: slot.day,
        time: slot.time || [],
        $createdAt: slot.$createdAt,
      });
      return acc;
    }, {});

    const doctorIds = Object.keys(groupedByDoctor);

    const doctorPromises = doctorIds.map(async (docId) => {
      try {
        const doctor = await databases.getDocument(
          DATABASE_ID,
          DOCTORS_COLLECTION_ID,
          docId
        );
        return {
          $id: doctor.$id,
          name: doctor.name,
          specialty: doctor.specialty,
          image: doctor.image,
        };
      } catch (error) {
        console.error(`Error fetching doctor ${docId}:`, error);
        return null;
      }
    });

    const doctors = (await Promise.all(doctorPromises)).filter(Boolean);

    const mergedData = doctors.map((doctor: any) => {
      return {
        doctorId: doctor.$id,
        doctor: {
          $id: doctor.$id,
          name: doctor.name,
          specialty: doctor.specialty,
          image: doctor.image,
        },
        timeSlots: groupedByDoctor[doctor.$id] || [],
      };
    });

    const total = mergedData.length;
    const paginatedData = mergedData.slice(offset, offset + limit);

    return {
      documents: paginatedData,
      total: total,
    };
  } catch (error) {
    console.error("Error fetching time slots with doctors:", error);
    throw error;
  }
}

export async function getTimeSlot(timeSlotId: string) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      TIME_SLOTS_ID,
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
    const updateData: any = {};

    if (data.docId) updateData.docId = data.docId;
    if (data.day) updateData.day = data.day;
    if (data.time) updateData.time = data.time;

    const response = await databases.updateDocument(
      DATABASE_ID,
      TIME_SLOTS_ID,
      timeSlotId,
      updateData
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
      TIME_SLOTS_ID,
      timeSlotId
    );
  } catch (error) {
    console.error("Error deleting time slot:", error);
    throw error;
  }
}

export async function getDoctorsAvailableForNewSlots() {
  try {
    console.log("Fetching all doctors...");
    const doctorsResponse = await databases.listDocuments(
      DATABASE_ID,
      DOCTORS_COLLECTION_ID,
      [Query.limit(1000)]
    );
    console.log(`Found ${doctorsResponse.documents.length} doctors`);

    console.log("Fetching all timeslots...");
    const timeSlotsResponse = await databases.listDocuments(
      DATABASE_ID,
      TIME_SLOTS_ID,
      [Query.limit(1000)]
    );
    console.log(`Found ${timeSlotsResponse.documents.length} timeslots`);

    const DAYS_OF_WEEK = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const doctorDays = new Map<string, Set<string>>();

    timeSlotsResponse.documents.forEach((slot: any) => {
      const docId = typeof slot.docId === 'string' ? slot.docId : slot.docId?.$id;
      if (docId) {
        if (!doctorDays.has(docId)) {
          doctorDays.set(docId, new Set());
        }
        doctorDays.get(docId)!.add(slot.day);
      }
    });

    const doctorsAvailable = doctorsResponse.documents.filter((doctor) => {
      const coveredDays = doctorDays.get(doctor.$id);

      if (!coveredDays) {
        return true;
      }

      return coveredDays.size < DAYS_OF_WEEK.length;
    });

    console.log(`Doctors available for new slots: ${doctorsAvailable.length}`);

    return doctorsAvailable;
  } catch (error) {
    console.error("Error fetching doctors available for new slots:", error);
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
