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
// NOTE: sesuaikan path import ini dengan lokasi file halaman Anda
import { useTheme } from "../../contexts/ThemeContext";

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

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Token warna sesuai tema (tidak bergantung pada CSS tema lama)
  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04]",
        title: "text-white",
        text: "text-white/70",
        muted: "text-white/45",
        line: "border-white/10",
        divider: "divide-white/10",
        thead: "bg-white/[0.03] text-white/50",
        rowHover: "hover:bg-white/[0.03]",
        field:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/60 focus:ring-lime-300/20 [color-scheme:dark]",
        iconWrap: "border-white/10 bg-white/[0.06] text-lime-300",
        avatar: "bg-lime-300 text-[#10150c]",
        badgeOn: "bg-lime-300/15 text-lime-300",
        badgeOff: "bg-white/[0.06] text-white/50",
        ghost: "border-white/10 text-white/70 hover:bg-white/[0.06]",
        edit: "text-white/50 hover:bg-lime-300/10 hover:text-lime-300",
        del: "text-white/50 hover:bg-red-500/10 hover:text-red-400",
        primary: "bg-lime-300 text-[#10150c] hover:bg-lime-200",
        modal: "border border-white/10 bg-[#141811] text-white",
        backdrop: "bg-black/60",
        close: "text-white/50 hover:bg-white/[0.08]",
      }
    : {
        card: "border-slate-200 bg-white shadow-sm",
        title: "text-slate-900",
        text: "text-slate-600",
        muted: "text-slate-400",
        line: "border-slate-100",
        divider: "divide-slate-100",
        thead: "bg-slate-50 text-slate-500",
        rowHover: "hover:bg-slate-50",
        field:
          "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-500/20",
        iconWrap: "border-lime-200 bg-lime-50 text-lime-700",
        avatar: "bg-lime-400 text-[#10150c]",
        badgeOn: "bg-lime-100 text-lime-800",
        badgeOff: "bg-slate-100 text-slate-500",
        ghost: "border-slate-200 text-slate-600 hover:bg-slate-50",
        edit: "text-slate-500 hover:bg-lime-50 hover:text-lime-700",
        del: "text-slate-500 hover:bg-red-50 hover:text-red-600",
        primary: "bg-lime-400 text-[#10150c] hover:bg-lime-300",
        modal: "border border-slate-200 bg-white text-slate-900",
        backdrop: "bg-slate-900/40",
        close: "text-slate-400 hover:bg-slate-100",
      };

  const field = `w-full border text-sm focus:outline-none focus:ring-2 ${c.field}`;

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
    { label: "Total Anggota", nilai: total, icon: Users },
    { label: "Anggota Aktif", nilai: aktif, icon: UserCheck },
    { label: "Nonaktif", nilai: nonaktif, icon: UserX },
  ];

  return (
    <div className="space-y-5">
      {/* Judul */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-semibold ${c.title}`}>Data Anggota</h2>
          <p className={`mt-0.5 text-sm ${c.muted}`}>
            Kelola data remaja masjid IRMA Baitussalam
          </p>
        </div>
        <button
          type="button"
          onClick={bukaTambah}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${c.primary}`}
        >
          <Plus className="h-4 w-4" />
          Tambah Anggota
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid gap-5 sm:grid-cols-3">
        {ringkasan.map(({ label, nilai, icon: Icon }) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-4 rounded-3xl border p-6 ${c.card}`}
          >
            <div>
              <p className={`text-sm font-medium ${c.text}`}>{label}</p>
              <p
                className={`mt-2 text-3xl font-semibold tracking-tight ${c.title}`}
              >
                {nilai}
              </p>
            </div>
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border ${c.iconWrap}`}
            >
              <Icon className="h-5 w-5" />
            </span>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div className={`overflow-hidden rounded-3xl border ${c.card}`}>
        {/* Toolbar */}
        <div className={`flex flex-wrap items-center gap-3 border-b p-5 ${c.line}`}>
          <div className="relative min-w-[240px] flex-1">
            <Search
              className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${c.muted}`}
            />
            <input
              type="search"
              value={cari}
              onChange={(e) => {
                setCari(e.target.value);
                setHalaman(1);
              }}
              placeholder="Cari nama atau nomor HP..."
              className={`${field} rounded-full py-2.5 pl-11 pr-4`}
            />
          </div>
          <select
            value={filterGender}
            onChange={(e) => {
              setFilterGender(e.target.value as "Semua" | Gender);
              setHalaman(1);
            }}
            className={`${field} !w-auto rounded-full px-4 py-2.5`}
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
            className={`${field} !w-auto rounded-full px-4 py-2.5`}
          >
            <option value="Semua">Semua status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={c.thead}>
              <tr>
                <th className="px-5 py-3 font-medium">Anggota</th>
                <th className="px-5 py-3 font-medium">Gender</th>
                <th className="px-5 py-3 font-medium">No. HP</th>
                <th className="px-5 py-3 font-medium">Alamat</th>
                <th className="px-5 py-3 font-medium">Bergabung</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${c.divider}`}>
              {tampil.map((a) => (
                <tr key={a.id} className={`transition-colors ${c.rowHover}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${c.avatar}`}
                      >
                        {inisial(a.nama)}
                      </div>
                      <span className={`whitespace-nowrap font-medium ${c.title}`}>
                        {a.nama}
                      </span>
                    </div>
                  </td>
                  <td className={`px-5 py-4 ${c.text}`}>{a.gender}</td>
                  <td className={`whitespace-nowrap px-5 py-4 ${c.text}`}>
                    {a.noHp}
                  </td>
                  <td className={`whitespace-nowrap px-5 py-4 ${c.text}`}>
                    {a.alamat}
                  </td>
                  <td className={`whitespace-nowrap px-5 py-4 ${c.text}`}>
                    {formatTanggal(a.bergabung)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        a.status === "Aktif" ? c.badgeOn : c.badgeOff
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
                        className={`rounded-full p-2 transition-colors ${c.edit}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(a)}
                        aria-label={`Hapus ${a.nama}`}
                        className={`rounded-full p-2 transition-colors ${c.del}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tampil.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className={`px-5 py-12 text-center ${c.muted}`}
                  >
                    Tidak ada anggota yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-sm ${c.line} ${c.muted}`}
        >
          <p>
            Menampilkan {tampil.length} dari {hasil.length} anggota
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={halamanAktif === 1}
              onClick={() => setHalaman(halamanAktif - 1)}
              aria-label="Halaman sebelumnya"
              className={`rounded-full border p-2 transition-colors disabled:opacity-40 ${c.ghost}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className={`px-2 font-medium ${c.text}`}>
              {halamanAktif} / {totalHalaman}
            </span>
            <button
              type="button"
              disabled={halamanAktif === totalHalaman}
              onClick={() => setHalaman(halamanAktif + 1)}
              aria-label="Halaman berikutnya"
              className={`rounded-full border p-2 transition-colors disabled:opacity-40 ${c.ghost}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal tambah / ubah */}
      {modalBuka && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${c.backdrop}`}
          onClick={() => setModalBuka(false)}
        >
          <form
            onSubmit={simpan}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg space-y-4 rounded-3xl p-7 shadow-2xl ${c.modal}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {editId === null ? "Tambah Anggota" : "Ubah Data Anggota"}
              </h3>
              <button
                type="button"
                onClick={() => setModalBuka(false)}
                aria-label="Tutup"
                className={`rounded-full p-2 transition-colors ${c.close}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="block">
              <span className={`text-sm font-medium ${c.text}`}>
                Nama lengkap
              </span>
              <input
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className={`${field} mt-1.5 rounded-xl px-4 py-2.5`}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className={`text-sm font-medium ${c.text}`}>Gender</span>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value as Gender })
                  }
                  className={`${field} mt-1.5 rounded-xl px-4 py-2.5`}
                >
                  <option value="Putra">Putra</option>
                  <option value="Putri">Putri</option>
                </select>
              </label>
              <label className="block">
                <span className={`text-sm font-medium ${c.text}`}>Status</span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as Status })
                  }
                  className={`${field} mt-1.5 rounded-xl px-4 py-2.5`}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className={`text-sm font-medium ${c.text}`}>No. HP</span>
                <input
                  required
                  type="tel"
                  value={form.noHp}
                  onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                  className={`${field} mt-1.5 rounded-xl px-4 py-2.5`}
                />
              </label>
              <label className="block">
                <span className={`text-sm font-medium ${c.text}`}>
                  Tanggal bergabung
                </span>
                <input
                  required
                  type="date"
                  value={form.bergabung}
                  onChange={(e) =>
                    setForm({ ...form, bergabung: e.target.value })
                  }
                  className={`${field} mt-1.5 rounded-xl px-4 py-2.5`}
                />
              </label>
            </div>

            <label className="block">
              <span className={`text-sm font-medium ${c.text}`}>Alamat</span>
              <input
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className={`${field} mt-1.5 rounded-xl px-4 py-2.5`}
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalBuka(false)}
                className={`rounded-full border px-6 py-2.5 text-sm font-medium transition-colors ${c.ghost}`}
              >
                Batal
              </button>
              <button
                type="submit"
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${c.primary}`}
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