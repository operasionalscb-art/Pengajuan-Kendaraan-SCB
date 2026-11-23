import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  collection,
  getDocs,
  getDoc,
  getDocFromServer,
  setDoc,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Vehicle, Booking, AppNotification, UserProfile, AppRole, EmailNotificationLog, EmailSettings } from '../types';
import { INITIAL_VEHICLES, INITIAL_BOOKINGS } from '../mockData';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with designated databaseId and ignoreUndefinedProperties to prevent undefined-field runtime crashes
export const db = initializeFirestore(
  app,
  { ignoreUndefinedProperties: true },
  firebaseConfig.firestoreDatabaseId
);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Non-blocking startup connection check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: the client is offline.');
    }
  }
}
void testConnection();

const SEED_MARKER_STORAGE_KEY = 'scb_firestore_seeded_v1';

// Seed Initial Data once without scanning entire collections on every page load
export async function seedInitialData() {
  try {
    if (typeof window !== 'undefined' && localStorage.getItem(SEED_MARKER_STORAGE_KEY) === 'true') {
      return;
    }

    const markerRef = doc(db, 'settings', 'seed_status');
    const markerSnap = await getDoc(markerRef);
    if (markerSnap.exists()) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(SEED_MARKER_STORAGE_KEY, 'true');
      }
      return;
    }

    // Use limit(1) instead of full collection scans when marker doesn't exist yet
    const [vehiclesSnapshot, bookingsSnapshot, usersSnapshot, notifsSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'vehicles'), limit(1))),
      getDocs(query(collection(db, 'bookings'), limit(1))),
      getDocs(query(collection(db, 'users'), limit(1))),
      getDocs(query(collection(db, 'notifications'), limit(1))),
    ]);

    const batch = writeBatch(db);
    let hasWrites = false;

    if (vehiclesSnapshot.empty) {
      INITIAL_VEHICLES.forEach((v) => {
        batch.set(doc(db, 'vehicles', v.id), v);
      });
      hasWrites = true;
    }

    if (bookingsSnapshot.empty) {
      INITIAL_BOOKINGS.forEach((b) => {
        batch.set(doc(db, 'bookings', b.id), b);
      });
      hasWrites = true;
    }

    if (usersSnapshot.empty) {
      const presets: UserProfile[] = [
        {
          email: 'operasional.scb@gmail.com',
          nama: 'Super Admin Sarpras',
          jabatan: 'Kepala Bagian Sarpras',
          role: 'Super Admin' as AppRole,
          password: 'admin123',
          status: 'Disetujui'
        },
        {
          email: 'operator.scb@gmail.com',
          nama: 'Ust. Operator Sarpras',
          jabatan: 'Staf Operasional Sarpras',
          role: 'Operator' as AppRole,
          password: 'operator123',
          status: 'Disetujui'
        },
        {
          email: 'kesiswaan.cendekia@baznas.sch.id',
          nama: 'Ust. Ahmad Fauzi',
          jabatan: 'Wakasek Kesiswaan',
          role: 'Pemohon' as AppRole,
          password: 'pegawai123',
          status: 'Disetujui'
        },
        {
          email: 'humas.cendekia@baznas.sch.id',
          nama: 'Ustz. Rahma Wardani',
          jabatan: 'Koordinator Humas',
          role: 'Pemohon' as AppRole,
          password: 'pegawai123',
          status: 'Disetujui'
        }
      ];
      presets.forEach((u) => {
        batch.set(doc(db, 'users', u.email.toLowerCase()), u);
      });
      hasWrites = true;
    }

    if (notifsSnapshot.empty) {
      const initialNotifs: AppNotification[] = [
        {
          id: 'N-001',
          title: 'Selamat Datang di SCB-GO!',
          message: 'Aplikasi manajemen peminjaman kendaraan operasional Sekolah Cendekia BAZNAS aktif dan siap melayani pengajuan Anda.',
          timestamp: '12-06 00:00',
          isRead: false,
          type: 'info'
        },
        {
          id: 'N-002',
          title: 'Pengajuan Selesai Diinput',
          message: 'Lomba Pramuka kesiswaan menggunakan Isuzu Elf Long telah disetujui untuk keberangkatan pagi ini.',
          timestamp: '12-06 07:00',
          isRead: false,
          type: 'success'
        }
      ];
      initialNotifs.forEach((n) => {
        batch.set(doc(db, 'notifications', n.id), n);
      });
      hasWrites = true;
    }

    batch.set(markerRef, { initialized: true, seededAt: new Date().toISOString() });
    await batch.commit();

    if (typeof window !== 'undefined') {
      localStorage.setItem(SEED_MARKER_STORAGE_KEY, 'true');
    }
    if (hasWrites) {
      console.log('Firestore initial seeding completed.');
    }
  } catch (error) {
    console.error('Error seeding initial data to Firestore:', error);
  }
}

// ------------------- Real-time Subscribers -------------------

export function subscribeVehicles(onUpdate: (vehicles: Vehicle[]) => void) {
  return onSnapshot(collection(db, 'vehicles'), (snapshot) => {
    const list: Vehicle[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Vehicle);
    });
    list.sort((a, b) => a.id.localeCompare(b.id));
    onUpdate(list);
  }, (error) => {
    console.error('Error subscribing to vehicles:', error);
  });
}

export function subscribeBookings(onUpdate: (bookings: Booking[]) => void) {
  const q = query(collection(db, 'bookings'), orderBy('tanggal_mulai', 'desc'), limit(200));
  return onSnapshot(q, (snapshot) => {
    const list: Booking[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Booking);
    });
    list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    onUpdate(list);
  }, (error) => {
    console.error('Error subscribing to bookings:', error);
  });
}

export function subscribeNotifications(onUpdate: (notifications: AppNotification[]) => void) {
  const q = query(collection(db, 'notifications'), orderBy('id', 'desc'), limit(30));
  return onSnapshot(q, (snapshot) => {
    const list: AppNotification[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as AppNotification);
    });
    list.sort((a, b) => b.id.localeCompare(a.id));
    onUpdate(list);
  }, (error) => {
    console.error('Error subscribing to notifications:', error);
  });
}

export function subscribeUsers(onUpdate: (users: UserProfile[]) => void) {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const list: UserProfile[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as UserProfile);
    });
    onUpdate(list);
  }, (error) => {
    console.error('Error subscribing to users:', error);
  });
}

export function subscribeEmailLogs(onUpdate: (logs: EmailNotificationLog[]) => void) {
  const q = query(collection(db, 'email_logs'), orderBy('id', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const list: EmailNotificationLog[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as EmailNotificationLog);
    });
    list.sort((a, b) => b.id.localeCompare(a.id));
    onUpdate(list);
  }, (error) => {
    console.error('Error subscribing to email logs:', error);
  });
}

export function subscribeEmailSettings(onUpdate: (settings: EmailSettings) => void) {
  return onSnapshot(doc(db, 'settings', 'email_config'), (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data() as EmailSettings);
    } else {
      const defaultSettings: EmailSettings = {
        operatorEmail: 'operasional.scb@gmail.com, operator.scb@gmail.com',
        notifyNewBooking: true,
        notifyStatusChange: true,
        notifyUserRegistration: true,
        enableDirectMailto: true
      };
      setDoc(doc(db, 'settings', 'email_config'), defaultSettings).catch(console.error);
      onUpdate(defaultSettings);
    }
  }, (error) => {
    console.error('Error subscribing to email settings:', error);
  });
}

// ------------------- Point Reads & Firestore Mutations -------------------

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const cleanEmail = email.trim().toLowerCase();
  const docRef = doc(db, 'users', cleanEmail);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${cleanEmail}`);
  }
}

export async function addOrUpdateVehicle(vehicle: Vehicle) {
  const docRef = doc(db, 'vehicles', vehicle.id);
  try {
    await setDoc(docRef, vehicle);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `vehicles/${vehicle.id}`);
  }
}

export async function deleteVehicleDoc(vehicleId: string) {
  const docRef = doc(db, 'vehicles', vehicleId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `vehicles/${vehicleId}`);
  }
}

export async function addOrUpdateBooking(booking: Booking) {
  const docRef = doc(db, 'bookings', booking.id);
  try {
    await setDoc(docRef, booking);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `bookings/${booking.id}`);
  }
}

export async function deleteBookingDoc(bookingId: string) {
  const docRef = doc(db, 'bookings', bookingId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bookings/${bookingId}`);
  }
}

export async function addOrUpdateNotification(notification: AppNotification) {
  const docRef = doc(db, 'notifications', notification.id);
  try {
    await setDoc(docRef, notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `notifications/${notification.id}`);
  }
}

export async function markNotificationReadDoc(notificationId: string) {
  const docRef = doc(db, 'notifications', notificationId);
  try {
    await updateDoc(docRef, { isRead: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
  }
}

export async function deleteNotificationDoc(notificationId: string) {
  const docRef = doc(db, 'notifications', notificationId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `notifications/${notificationId}`);
  }
}

export async function deleteNotificationsBatch(notificationIds: string[]) {
  if (notificationIds.length === 0) return;
  try {
    for (let i = 0; i < notificationIds.length; i += 450) {
      const chunk = notificationIds.slice(i, i + 450);
      const batch = writeBatch(db);
      chunk.forEach((id) => {
        batch.delete(doc(db, 'notifications', id));
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'notifications');
  }
}

export async function addOrUpdateUser(user: UserProfile) {
  const cleanEmail = user.email.trim().toLowerCase();
  const docRef = doc(db, 'users', cleanEmail);
  try {
    await setDoc(docRef, { ...user, email: cleanEmail });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${cleanEmail}`);
  }
}

export async function replaceUserEmailDoc(oldEmail: string, updatedUser: UserProfile) {
  const oldClean = oldEmail.trim().toLowerCase();
  const newClean = updatedUser.email.trim().toLowerCase();
  try {
    const batch = writeBatch(db);
    if (oldClean !== newClean) {
      batch.delete(doc(db, 'users', oldClean));
    }
    batch.set(doc(db, 'users', newClean), { ...updatedUser, email: newClean });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${newClean}`);
  }
}

export async function batchUpsertUsers(users: UserProfile[]) {
  if (users.length === 0) return;
  try {
    for (let i = 0; i < users.length; i += 450) {
      const chunk = users.slice(i, i + 450);
      const batch = writeBatch(db);
      chunk.forEach((u) => {
        const cleanEmail = u.email.trim().toLowerCase();
        batch.set(doc(db, 'users', cleanEmail), { ...u, email: cleanEmail });
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
  }
}

export async function deleteUserDoc(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const docRef = doc(db, 'users', cleanEmail);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${cleanEmail}`);
  }
}

export async function batchDeleteUsers(emails: string[]) {
  if (emails.length === 0) return;
  try {
    for (let i = 0; i < emails.length; i += 450) {
      const chunk = emails.slice(i, i + 450);
      const batch = writeBatch(db);
      chunk.forEach((email) => {
        batch.delete(doc(db, 'users', email.trim().toLowerCase()));
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'users');
  }
}

export async function addEmailLog(log: EmailNotificationLog) {
  const docRef = doc(db, 'email_logs', log.id);
  try {
    await setDoc(docRef, log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `email_logs/${log.id}`);
  }
}

export async function deleteEmailLogDoc(logId: string) {
  const docRef = doc(db, 'email_logs', logId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `email_logs/${logId}`);
  }
}

export async function saveEmailSettingsDoc(settings: EmailSettings) {
  const docRef = doc(db, 'settings', 'email_config');
  try {
    await setDoc(docRef, settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/email_config');
  }
}
