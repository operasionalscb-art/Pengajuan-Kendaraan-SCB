import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { Vehicle, Booking, AppNotification, UserProfile, AppRole } from '../types';
import { INITIAL_VEHICLES, INITIAL_BOOKINGS } from '../mockData';

// Web app Firebase configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyDuZiVoJP37dUDyVfVAm-byhSIEQawvdv4",
  authDomain: "vast-summit-scf5x.firebaseapp.com",
  projectId: "vast-summit-scf5x",
  storageBucket: "vast-summit-scf5x.firebasestorage.app",
  messagingSenderId: "762855733058",
  appId: "1:762855733058:web:01372b69009583b384badb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore using the designated databaseId as the third parameter
export const db = initializeFirestore(app, {}, "ai-studio-46166df5-8b36-4010-a40f-cc8736483d1e");

// Seed Initial Data if collections are empty
export async function seedInitialData() {
  try {
    // 1. Seed Vehicles
    const vehiclesCol = collection(db, 'vehicles');
    const vehiclesSnapshot = await getDocs(vehiclesCol);
    if (vehiclesSnapshot.empty) {
      console.log('Seeding initial vehicles to Firestore...');
      const batch = writeBatch(db);
      INITIAL_VEHICLES.forEach((v) => {
        const docRef = doc(db, 'vehicles', v.id);
        batch.set(docRef, v);
      });
      await batch.commit();
    }

    // 2. Seed Bookings
    const bookingsCol = collection(db, 'bookings');
    const bookingsSnapshot = await getDocs(bookingsCol);
    if (bookingsSnapshot.empty) {
      console.log('Seeding initial bookings to Firestore...');
      const batch = writeBatch(db);
      INITIAL_BOOKINGS.forEach((b) => {
        const docRef = doc(db, 'bookings', b.id);
        batch.set(docRef, b);
      });
      await batch.commit();
    }

    // 3. Seed Registered Users
    const usersCol = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCol);
    if (usersSnapshot.empty) {
      console.log('Seeding initial users to Firestore...');
      const presets = [
        {
          email: 'operasional.scb@gmail.com',
          nama: 'Super Admin Sarpras',
          jabatan: 'Kepala Bagian Sarpras',
          role: 'Super Admin' as AppRole,
          password: 'admin123'
        },
        {
          email: 'operator.scb@gmail.com',
          nama: 'Ust. Operator Sarpras',
          jabatan: 'Staf Operasional Sarpras',
          role: 'Operator' as AppRole,
          password: 'operator123'
        },
        {
          email: 'kesiswaan.cendekia@baznas.sch.id',
          nama: 'Ust. Ahmad Fauzi',
          jabatan: 'Wakasek Kesiswaan',
          role: 'Pemohon' as AppRole,
          password: 'pegawai123'
        },
        {
          email: 'humas.cendekia@baznas.sch.id',
          nama: 'Ustz. Rahma Wardani',
          jabatan: 'Koordinator Humas',
          role: 'Pemohon' as AppRole,
          password: 'pegawai123'
        }
      ];
      const batch = writeBatch(db);
      presets.forEach((u) => {
        const docRef = doc(db, 'users', u.email.toLowerCase());
        batch.set(docRef, u);
      });
      await batch.commit();
    }

    // 4. Seed Notifications
    const notifsCol = collection(db, 'notifications');
    const notifsSnapshot = await getDocs(notifsCol);
    if (notifsSnapshot.empty) {
      console.log('Seeding initial notifications to Firestore...');
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
      const batch = writeBatch(db);
      initialNotifs.forEach((n) => {
        const docRef = doc(db, 'notifications', n.id);
        batch.set(docRef, n);
      });
      await batch.commit();
    }
    
    console.log('Firestore seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding initial data to Firestore:', error);
  }
}

// ------------------- Real-time Subscribers -------------------

export function subscribeVehicles(onUpdate: (vehicles: Vehicle[]) => void) {
  return onSnapshot(collection(db, 'vehicles'), (snapshot) => {
    const list: Vehicle[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Vehicle);
    });
    // Sort vehicles by ID
    list.sort((a, b) => a.id.localeCompare(b.id));
    onUpdate(list);
  }, (error) => {
    console.error('Error subscribing to vehicles:', error);
  });
}

export function subscribeBookings(onUpdate: (bookings: Booking[]) => void) {
  return onSnapshot(collection(db, 'bookings'), (snapshot) => {
    const list: Booking[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Booking);
    });
    // Sort bookings by creation date descending
    list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    onUpdate(list);
  }, (error) => {
    console.error('Error subscribing to bookings:', error);
  });
}

export function subscribeNotifications(onUpdate: (notifications: AppNotification[]) => void) {
  return onSnapshot(collection(db, 'notifications'), (snapshot) => {
    const list: AppNotification[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as AppNotification);
    });
    // Sort notifications: newer first
    // Since timestamp is formatted like '12-06 08:00', we can sort by id or timestamp string if id contains timestamp
    list.sort((a, b) => b.id.localeCompare(a.id));
    onUpdate(list);
  }, (error) => {
    console.error('Error subscribing to notifications:', error);
  });
}

export function subscribeUsers(onUpdate: (users: UserProfile[]) => void) {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const list: UserProfile[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as UserProfile);
    });
    onUpdate(list);
  }, (error) => {
    console.error('Error subscribing to users:', error);
  });
}

// ------------------- Firestore Mutations -------------------

export async function addOrUpdateVehicle(vehicle: Vehicle) {
  const docRef = doc(db, 'vehicles', vehicle.id);
  await setDoc(docRef, vehicle);
}

export async function deleteVehicleDoc(vehicleId: string) {
  const docRef = doc(db, 'vehicles', vehicleId);
  await deleteDoc(docRef);
}

export async function addOrUpdateBooking(booking: Booking) {
  const docRef = doc(db, 'bookings', booking.id);
  await setDoc(docRef, booking);
}

export async function deleteBookingDoc(bookingId: string) {
  const docRef = doc(db, 'bookings', bookingId);
  await deleteDoc(docRef);
}

export async function addOrUpdateNotification(notification: AppNotification) {
  const docRef = doc(db, 'notifications', notification.id);
  await setDoc(docRef, notification);
}

export async function deleteNotificationDoc(notificationId: string) {
  const docRef = doc(db, 'notifications', notificationId);
  await deleteDoc(docRef);
}

export async function addOrUpdateUser(user: UserProfile) {
  const docRef = doc(db, 'users', user.email.toLowerCase());
  await setDoc(docRef, user);
}

export async function deleteUserDoc(email: string) {
  const docRef = doc(db, 'users', email.toLowerCase());
  await deleteDoc(docRef);
}
