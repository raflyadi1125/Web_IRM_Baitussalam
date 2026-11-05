import bcrypt from "bcryptjs";
import { db } from "./db.ts";

// Akun awal untuk pengembangan. Ganti password sebelum dipakai sungguhan.
const users = [
  { email: "admin@irm.test", nama: "Admin IRM", role: "ADMIN", password: "admin123" },
  { email: "sekretaris@irm.test", nama: "Sekretaris IRM", role: "SEKRETARIS", password: "sekretaris123" },
  { email: "bendahara@irm.test", nama: "Bendahara IRM", role: "BENDAHARA", password: "bendahara123" },
  { email: "anggota@irm.test", nama: "Anggota IRM", role: "ANGGOTA", password: "anggota123" },
] as const;

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  for (const { password, ...user } of users) {
    const passwordHash = await bcrypt.hash(password, 10);

    await db.orm.public.User.upsert({
      create: { ...user, password: passwordHash, status: "AKTIF" },
      update: { nama: user.nama, role: user.role, password: passwordHash, status: "AKTIF" },
      conflictOn: { email: user.email },
    });
  }
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}