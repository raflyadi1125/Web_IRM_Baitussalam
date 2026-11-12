import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  AtSign,
  Calendar,
  Camera,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface ProfileForm {
  nama: string;
  email: string;
  noHp: string;
  alamat: string;
  tanggalLahir: string;
  jenisKelamin: string;
  instagram: string;
  bio: string;
}

type Extra = Omit<ProfileForm, "nama">;
type FormErrors = Partial<Record<keyof ProfileForm, string>>;

const EXTRA_KEY = "profile_extra";
const PHOTO_KEY = "profile_photo";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const PHOTO_SIZE = 256; // px, hasil foto persegi
const BIO_MAX = 160;

const EMPTY_EXTRA: Extra = {
  email: "",
  noHp: "",
  alamat: "",
  tanggalLahir: "",
  jenisKelamin: "",
  instagram: "",
  bio: "",
};

const readExtra = (): Extra => {
  try {
    const raw = localStorage.getItem(EXTRA_KEY);
    if (raw) return { ...EMPTY_EXTRA, ...JSON.parse(raw) };
  } catch {
    /* abaikan */
  }
  return { ...EMPTY_EXTRA };
};

const readPhoto = (): string => {
  try {
    return localStorage.getItem(PHOTO_KEY) ?? "";
  } catch {
    return "";
  }
};

/** Potong foto jadi persegi (tengah), kecilkan, lalu jadikan data URL JPEG */
const processImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PHOTO_SIZE;
      canvas.height = PHOTO_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas tidak tersedia"));
        return;
      }
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak bisa dibaca"));
    };

    img.src = url;
  });

export default function ProfilePage() {
  const { session } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sessionEmail = (session as { email?: string } | null)?.email ?? "";
  const roleText = session?.role
    ? session.role.charAt(0).toUpperCase() + session.role.slice(1)
    : "";

  const buildForm = (): ProfileForm => {
    const extra = readExtra();
    return {
      nama: session?.name ?? "",
      ...extra,
      email: extra.email || sessionEmail,
    };
  };

  const [form, setForm] = useState<ProfileForm>(buildForm);
  const [photo, setPhoto] = useState<string>(readPhoto);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  // Sinkronkan jika sesi berubah
  useEffect(() => {
    if (!editing) setForm(buildForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Pesan sukses hilang sendiri
  useEffect(() => {
    if (notice?.type !== "success") return;
    const t = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(t);
  }, [notice]);

  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04] text-white",
        strong: "text-white",
        soft: "text-white/50",
        input:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-lime-300/60 focus:ring-lime-300/20 disabled:text-white/60",
        accent: "text-lime-300",
        ghost: "border-white/10 text-white/80 hover:bg-white/[0.06]",
        success: "bg-lime-300/10 text-lime-300",
        error: "bg-red-400/10 text-red-300",
        errorText: "text-red-300",
        avatarRing: "ring-white/10",
        cameraBtn: "border-[#0c0f0b]",
        option: "bg-[#1a1f17] text-white",
      }
    : {
        card: "border-slate-200 bg-white text-slate-800",
        strong: "text-slate-900",
        soft: "text-slate-500",
        input:
          "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-500/20 disabled:bg-slate-50 disabled:text-slate-600",
        accent: "text-lime-700",
        ghost: "border-slate-200 text-slate-700 hover:bg-slate-100",
        success: "bg-lime-50 text-lime-700",
        error: "bg-red-50 text-red-600",
        errorText: "text-red-600",
        avatarRing: "ring-slate-200",
        cameraBtn: "border-white",
        option: "bg-white text-slate-800",
      };

  const initials = (form.nama || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Hapus pesan error field yang sedang diubah
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // supaya file yang sama bisa dipilih ulang
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice({ type: "error", text: "File harus berupa gambar." });
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setNotice({ type: "error", text: "Ukuran foto maksimal 5 MB." });
      return;
    }

    try {
      setPhoto(await processImage(file));
      setNotice(null);
    } catch {
      setNotice({ type: "error", text: "Foto gagal diproses, coba gambar lain." });
    }
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    const email = form.email.trim();
    const noHp = form.noHp.trim();
    const instagram = form.instagram.trim().replace(/^@/, "");

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Format email tidak valid.";
    }
    if (noHp && !/^[0-9+\-\s]{8,16}$/.test(noHp)) {
      next.noHp = "No. HP harus 8–16 karakter (angka, +, atau -).";
    }
    if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) {
      next.instagram = "Username Instagram tidak valid.";
    }
    if (form.tanggalLahir) {
      const dob = new Date(form.tanggalLahir);
      if (Number.isNaN(dob.getTime()) || dob > new Date()) {
        next.tanggalLahir = "Tanggal lahir tidak valid.";
      }
    }
    return next;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setNotice({ type: "error", text: "Periksa kembali isian yang ditandai." });
      return;
    }

    try {
      const { nama: _nama, ...extra } = form;
      const cleaned: Extra = {
        ...extra,
        email: extra.email.trim(),
        noHp: extra.noHp.trim(),
        alamat: extra.alamat.trim(),
        instagram: extra.instagram.trim().replace(/^@/, ""),
        bio: extra.bio.trim(),
      };
      localStorage.setItem(EXTRA_KEY, JSON.stringify(cleaned));

      if (photo) localStorage.setItem(PHOTO_KEY, photo);
      else localStorage.removeItem(PHOTO_KEY);

      // TODO: panggil API update profil (termasuk upload foto) di sini
      setForm((prev) => ({ ...prev, ...cleaned }));
      setNotice({ type: "success", text: "Profil berhasil disimpan." });
      setEditing(false);
    } catch {
      setNotice({
        type: "error",
        text: "Gagal menyimpan profil. Penyimpanan browser mungkin penuh.",
      });
    }
  };

  const handleCancel = () => {
    setForm(buildForm());
    setPhoto(readPhoto());
    setErrors({});
    setEditing(false);
    setNotice(null);
  };

  const field = (
    name: keyof ProfileForm,
    label: string,
    Icon: typeof User,
    opts: {
      type?: string;
      textarea?: boolean;
      readOnly?: boolean;
      placeholder?: string;
      maxLength?: number;
      options?: string[];
    } = {}
  ) => {
    const common = {
      name,
      value: form[name],
      onChange: handleChange,
      disabled: !editing || opts.readOnly,
      placeholder: editing ? opts.placeholder : undefined,
      className: `w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 ${c.input}`,
    };

    let control;
    if (opts.options) {
      control = (
        <select {...common}>
          <option value="" className={c.option}>
            Pilih…
          </option>
          {opts.options.map((o) => (
            <option key={o} value={o} className={c.option}>
              {o}
            </option>
          ))}
        </select>
      );
    } else if (opts.textarea) {
      control = (
        <textarea
          rows={3}
          maxLength={opts.maxLength}
          {...common}
          className={`${common.className} resize-none`}
        />
      );
    } else {
      control = <input type={opts.type ?? "text"} {...common} />;
    }

    return (
      <label className="block">
        <span className="mb-1.5 flex items-center justify-between">
          <span className={`text-xs font-medium ${c.soft}`}>{label}</span>
          {opts.textarea && opts.maxLength && editing && (
            <span className={`text-xs ${c.soft}`}>
              {form[name].length}/{opts.maxLength}
            </span>
          )}
        </span>
        <span className="relative block">
          <Icon
            className={`pointer-events-none absolute left-4 top-3 h-4 w-4 ${c.soft}`}
          />
          {control}
        </span>
        {errors[name] && (
          <span className={`mt-1 block text-xs ${c.errorText}`}>
            {errors[name]}
          </span>
        )}
      </label>
    );
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-6 lg:px-8">
      <div className={`rounded-2xl border p-6 ${c.card}`}>
        {/* Kepala profil */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative shrink-0">
            <div
              className={`grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-lime-300 text-2xl font-bold text-[#10150c] ring-2 ${c.avatarRing}`}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={`Foto profil ${form.nama || "pengguna"}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </div>

            {editing && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Ganti foto profil"
                className={`absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 bg-lime-300 text-[#10150c] transition-transform hover:scale-105 ${c.cameraBtn}`}
              >
                <Camera className="h-4 w-4" />
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className={`truncate text-xl font-semibold ${c.strong}`}>
              {form.nama || "Pengguna"}
            </h2>
            {roleText && (
              <p className={`text-sm font-medium ${c.accent}`}>{roleText}</p>
            )}
            {editing && photo && (
              <button
                type="button"
                onClick={() => setPhoto("")}
                className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium ${c.errorText} hover:underline`}
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus foto
              </button>
            )}
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setNotice(null);
              }}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${c.ghost}`}
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}
        </div>

        {notice && (
          <p
            role={notice.type === "error" ? "alert" : "status"}
            className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${
              notice.type === "error" ? c.error : c.success
            }`}
          >
            {notice.text}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Nama berasal dari sesi login, jadi hanya-baca */}
          {field("nama", "Nama Lengkap", User, { readOnly: true })}

          <div className="grid gap-4 sm:grid-cols-2">
            {field("email", "Email", Mail, {
              type: "email",
              placeholder: "nama@email.com",
            })}
            {field("noHp", "No. HP", Phone, {
              type: "tel",
              placeholder: "08xxxxxxxxxx",
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {field("tanggalLahir", "Tanggal Lahir", Calendar, {
              type: "date",
            })}
            {field("jenisKelamin", "Jenis Kelamin", Users, {
              options: ["Laki-laki", "Perempuan"],
            })}
          </div>

          {field("instagram", "Instagram", AtSign, {
            placeholder: "username",
            maxLength: 31,
          })}
          {field("alamat", "Alamat", MapPin, {
            textarea: true,
            placeholder: "Alamat lengkap",
          })}
          {field("bio", "Tentang Saya", FileText, {
            textarea: true,
            maxLength: BIO_MAX,
            placeholder: "Ceritakan singkat tentang dirimu",
          })}

          {editing && (
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full bg-lime-300 px-5 py-2.5 text-sm font-semibold text-[#10150c] transition-opacity hover:opacity-90"
              >
                <Save className="h-4 w-4" /> Simpan
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${c.ghost}`}
              >
                <X className="h-4 w-4" /> Batal
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}