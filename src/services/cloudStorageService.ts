import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, validateDatabaseConnection } from '../lib/firebase';
import { User, Warga, IuranWajib, Pengeluaran, KasSosial, AuditLog } from '../types';
import {
  INITIAL_USERS,
  INITIAL_WARGA,
  INITIAL_IURAN,
  INITIAL_PENGELUARAN,
  INITIAL_KAS_SOSIAL
} from '../data/mockData';

export interface CloudSyncResult {
  users: User[];
  warga: Warga[];
  iuran: IuranWajib[];
  pengeluaran: Pengeluaran[];
  kasSosial: KasSosial[];
  auditLogs: AuditLog[];
}

export class CloudStorageService {
  private static isConnected: boolean | null = null;

  static async testConnection(): Promise<boolean> {
    try {
      this.isConnected = await validateDatabaseConnection();
      return this.isConnected;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  // Initial Sync from Cloud Database
  static async loadAllData(): Promise<CloudSyncResult> {
    try {
      await this.testConnection();

      // Load Users
      const usersSnap = await getDocs(collection(db, 'users'));
      let users: User[] = [];
      if (!usersSnap.empty) {
        usersSnap.forEach((d) => users.push(d.data() as User));
      } else {
        // Seed default users to cloud
        users = [...INITIAL_USERS];
        await this.batchSave('users', users);
      }

      // Ensure Admin exists
      if (!users.some((u) => u.username.toLowerCase() === 'admin')) {
        const adminUser = INITIAL_USERS.find((u) => u.username.toLowerCase() === 'admin');
        if (adminUser) {
          users = [adminUser, ...users];
          await setDoc(doc(db, 'users', adminUser.id), adminUser);
        }
      }

      // Load Warga
      const wargaSnap = await getDocs(collection(db, 'warga'));
      let warga: Warga[] = [];
      if (!wargaSnap.empty) {
        wargaSnap.forEach((d) => warga.push(d.data() as Warga));
      } else {
        warga = [...INITIAL_WARGA];
        await this.batchSave('warga', warga);
      }

      // Load Iuran
      const iuranSnap = await getDocs(collection(db, 'iuran_wajib'));
      let iuran: IuranWajib[] = [];
      if (!iuranSnap.empty) {
        iuranSnap.forEach((d) => iuran.push(d.data() as IuranWajib));
      } else {
        iuran = [...INITIAL_IURAN];
        await this.batchSave('iuran_wajib', iuran);
      }

      // Load Pengeluaran
      const pengeluaranSnap = await getDocs(collection(db, 'pengeluaran'));
      let pengeluaran: Pengeluaran[] = [];
      if (!pengeluaranSnap.empty) {
        pengeluaranSnap.forEach((d) => pengeluaran.push(d.data() as Pengeluaran));
      } else {
        pengeluaran = [...INITIAL_PENGELUARAN];
        await this.batchSave('pengeluaran', pengeluaran);
      }

      // Load Kas Sosial
      const ksSnap = await getDocs(collection(db, 'kas_sosial'));
      let kasSosial: KasSosial[] = [];
      if (!ksSnap.empty) {
        ksSnap.forEach((d) => kasSosial.push(d.data() as KasSosial));
      } else {
        kasSosial = [...INITIAL_KAS_SOSIAL];
        await this.batchSave('kas_sosial', kasSosial);
      }

      // Load Audit Logs
      const auditSnap = await getDocs(collection(db, 'audit_logs'));
      const auditLogs: AuditLog[] = [];
      if (!auditSnap.empty) {
        auditSnap.forEach((d) => auditLogs.push(d.data() as AuditLog));
      }

      return {
        users,
        warga,
        iuran,
        pengeluaran,
        kasSosial,
        auditLogs
      };
    } catch (err) {
      console.error('Error loading data from Cloud Database:', err);
      // Fallback to local storage if network or offline
      return {
        users: INITIAL_USERS,
        warga: INITIAL_WARGA,
        iuran: INITIAL_IURAN,
        pengeluaran: INITIAL_PENGELUARAN,
        kasSosial: INITIAL_KAS_SOSIAL,
        auditLogs: []
      };
    }
  }

  // Batch helper
  private static async batchSave<T extends { id: string }>(collName: string, items: T[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      for (const item of items) {
        const ref = doc(db, collName, item.id);
        batch.set(ref, item);
      }
      await batch.commit();
    } catch (err) {
      console.warn(`Failed to batch save ${collName}:`, err);
    }
  }

  // Realtime updates for Single Document
  static async saveEntity<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
    try {
      await setDoc(doc(db, collectionName, item.id), item);
    } catch (err) {
      console.error(`Failed to save ${collectionName} with id ${item.id}:`, err);
    }
  }

  static async deleteEntity(collectionName: string, id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.error(`Failed to delete ${collectionName} with id ${id}:`, err);
    }
  }
}
