import bcrypt from "bcryptjs";
import { db } from "./db.ts";

// Akun awal untuk pengembangan. Ganti password sebelum dipakai sungguhan.
const users = [
  { email: "admin@irm.test", username: "admin", name: "Admin IRM", role: "admin", password: "admin123" },
  { email: "sekretaris@irm.test", username: "sekretaris", name: "Sekretaris IRM", role: "sekretaris", password: "sekretaris123" },
  { email: "bendahara@irm.test", username: "bendahara", name: "Bendahara IRM", role: "bendahara", password: "bendahara123" },
  { email: "anggota@irm.test", username: "anggota", name: "Anggota IRM", role: "anggota", password: "anggota123" },
] as const;

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  for (const { password, ...user } of users) {
    const passwordHash = await bcrypt.hash(password, 10);

    await db.orm.public.User.upsert({
      create: { ...user, passwordHash },
      update: { name: user.name, role: user.role, passwordHash },
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