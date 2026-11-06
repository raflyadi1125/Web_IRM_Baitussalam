import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ---------- Tipe & data contoh (ganti dengan data dari API) ---------- */

type Gender = "Putra" | "Putri";
type Status = "Aktif" | "Nonaktif";

interface Anggota {
  id: number;
  nama: string;
  gender: Gender;
  noHp: string;
  alamat: string;
  bergabung: string; // format YYYY-MM-DD
  status: Status;
}

const DATA_AWAL: Anggota[] = [
  { id: 1, nama: "Ahmad Rizky", gender: "Putra", noHp: "081234567801", alamat: "RT 02 / RW 05", bergabung: "2022-01-10", status: "Aktif" },
  { id: 2, nama: "Siti Nurhaliza", gender: "Putri", noHp: "081234567802", alamat: "RT 01 / RW 05", bergabung: "2022-03-14", status: "Aktif" },
  { id: 3, nama: "Muhammad Fadhil", gender: "Putra", noHp: "081234567803", alamat: "RT 03 / RW 04", bergabung: "2022-06-02", status: "Aktif" },
  { id: 4, nama: "Aisyah Zahra", gender: "Putri", noHp: "081234567804", alamat: "RT 04 / RW 05", bergabung: "2023-01-21", status: "Aktif" },
  { id: 5, nama: "Fauzan Alfarizi", gender: "Putra", noHp: "081234567805", alamat: "RT 02 / RW 03", bergabung: "2023-05-09", status: "Nonaktif" },
  { id: 6, nama: "Nabila Putri", gender: "Putri", noHp: "081234567806", alamat: "RT 05 / RW 05", bergabung: "2023-08-30", status: "Aktif" },
  { id: 7, nama: "Rafi Pratama", gender: "Putra", noHp: "081234567807", alamat: "RT 01 / RW 02", bergabung: "2024-02-17", status: "Aktif" },
  { id: 8, nama: "Khairunnisa", gender: "Putri", noHp: "081234567808", alamat: "RT 03 / RW 05", bergabung: "2024-04-05", status: "Nonaktif" },
  { id: 9, nama: "Hafidz Ramadhan", gender: "Putra", noHp: "081234567809", alamat: "RT 04 / RW 04", bergabung: "2024-09-12", status: "Aktif" },
  { id: 10, nama: "Salsabila", gender: "Putri", noHp: "081234567810", alamat: "RT 02 / RW 05", bergabung: "2025-01-08", status: "Aktif" },
];

const PER_HALAMAN = 8;

const KOSONG: Omit<Anggota, "id"> = {
  nama: "",
  gender: "Putra",
  noHp: "",
  alamat: "",
  bergabung: new Date().toISOString().slice(0, 10),
  status: "Aktif",
};

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const inisial = (nama: string) =>
  nama
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ---------- Halaman ---------- */

const DataAnggota = (): ReactElement => {
  const [daftar, setDaftar] = useState<Anggota[]>(DATA_AWAL);
  const [cari, setCari] = useState("");
  const [filterGender, setFilterGender] = useState<"Semua" | Gender>("Semua");
  const [filterStatus, setFilterStatus] = useState<"Semua" | Status>("Semua");
  const [halaman, setHalaman] = useState(1);

  const [modalBuka, setModalBuka] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Anggota, "id">>(KOSONG);

  /* Ringkasan */
  const total = daftar.length;
  const aktif = daftar.filter((a) => a.status === "Aktif").length;
  const nonaktif = total - aktif;

  /* Filter + pagination */
  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return daftar.filter(
      (a) =>
        (filterGender === "Semua" || a.gender === filterGender) &&
        (filterStatus === "Semua" || a.status === filterStatus) &&
        (!q || a.nama.toLowerCase().includes(q) || a.noHp.includes(q))
    );
  }, [daftar, cari, filterGender, filterStatus]);

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const halamanAktif = Math.min(halaman, totalHalaman);
  const tampil = hasil.slice(
    (halamanAktif - 1) * PER_HALAMAN,
    halamanAktif * PER_HALAMAN
  );

  /* Aksi */
  const bukaTambah = () => {
    setEditId(null);
    setForm({ ...KOSONG, bergabung: new Date().toISOString().slice(0, 10) });
    setModalBuka(true);
  };

  const bukaEdit = (a: Anggota) => {
    const { id, ...data } = a;
    setEditId(id);
    setForm(data);
    setModalBuka(true);
  };

  const simpan = (e: FormEvent) => {
    e.preventDefault();
    if (editId === null) {
      setDaftar((prev) => [{ id: Date.now(), ...form }, ...prev]);
    } else {
      setDaftar((prev) =>
        prev.map((a) => (a.id === editId ? { id: editId, ...form } : a))
      );
    }
    setModalBuka(false);
  };

  const hapus = (a: Anggota) => {
    if (window.confirm(`Hapus anggota "${a.nama}"?`)) {
      setDaftar((prev) => prev.filter((x) => x.id !== a.id));
    }
  };

  const ringkasan = [
    { label: "Total Anggota", nilai: total, icon: Users, warna: "bg-emerald-50 text-emerald-600" },
    { label: "Anggota Aktif", nilai: aktif, icon: UserCheck, warna: "bg-sky-50 text-sky-600" },
    { label: "Nonaktif", nilai: nonaktif, icon: UserX, warna: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-6 bg-slate-50 px-11 py-10">
      {/* Judul */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Data Anggota</h2>
          <p className="text-slate-500">
            Kelola data remaja masjid IRMA Baitussalam
          </p>
        </div>
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-emerald-950 transition-colors hover:bg-amber-400"
        >
          <Plus className="h-5 w-5" />
          Tambah Anggota
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid gap-5 sm:grid-cols-3">
        {ringkasan.map(({ label, nilai, icon: Icon, warna }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className={`rounded-xl p-3 ${warna}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900">{nilai}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={cari}
              onChange={(e) => {
                setCari(e.target.value);
                setHalaman(1);
              }}
              placeholder="Cari nama atau nomor HP..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
          <select
            value={filterGender}
            onChange={(e) => {
              setFilterGender(e.target.value as "Semua" | Gender);
              setHalaman(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="Semua">Semua gender</option>
            <option value="Putra">Putra</option>
            <option value="Putri">Putri</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as "Semua" | Status);
              setHalaman(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="Semua">Semua status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Anggota</th>
                <th className="px-5 py-3 font-semibold">Gender</th>
                <th className="px-5 py-3 font-semibold">No. HP</th>
                <th className="px-5 py-3 font-semibold">Alamat</th>
                <th className="px-5 py-3 font-semibold">Bergabung</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tampil.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                        {inisial(a.nama)}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {a.nama}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{a.gender}</td>
                  <td className="px-5 py-4 text-slate-600">{a.noHp}</td>
                  <td className="px-5 py-4 text-slate-600">{a.alamat}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatTanggal(a.bergabung)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        a.status === "Aktif"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => bukaEdit(a)}
                        aria-label={`Ubah ${a.nama}`}
                        className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(a)}
                        aria-label={`Hapus ${a.nama}`}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tampil.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    Tidak ada anggota yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          <p>
            Menampilkan {tampil.length} dari {hasil.length} anggota
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={halamanAktif === 1}
              onClick={() => setHalaman(halamanAktif - 1)}
              aria-label="Halaman sebelumnya"
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              {halamanAktif} / {totalHalaman}
            </span>
            <button
              type="button"
              disabled={halamanAktif === totalHalaman}
              onClick={() => setHalaman(halamanAktif + 1)}
              aria-label="Halaman berikutnya"
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal tambah / ubah */}
      {modalBuka && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setModalBuka(false)}
        >
          <form
            onSubmit={simpan}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-7 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editId === null ? "Tambah Anggota" : "Ubah Data Anggota"}
              </h3>
              <button
                type="button"
                onClick={() => setModalBuka(false)}
                aria-label="Tutup"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Nama lengkap</span>
              <input
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Gender</span>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value as Gender })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Putra">Putra</option>
                  <option value="Putri">Putri</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as Status })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">No. HP</span>
                <input
                  required
                  type="tel"
                  value={form.noHp}
                  onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Tanggal bergabung</span>
                <input
                  required
                  type="date"
                  value={form.bergabung}
                  onChange={(e) => setForm({ ...form, bergabung: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Alamat</span>
              <input
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalBuka(false)}
                className="rounded-lg border border-slate-200 px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DataAnggota;