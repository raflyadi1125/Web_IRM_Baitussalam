import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Mail, MapPin, Pencil, Phone, Save, User, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface ProfileForm {
  nama: string;
  email: string;
  noHp: string;
  alamat: string;
}

const EXTRA_KEY = "profile_extra";

type Extra = Omit<ProfileForm, "nama">;

const readExtra = (): Extra => {
  try {
    const raw = localStorage.getItem(EXTRA_KEY);
    if (raw) return { email: "", noHp: "", alamat: "", ...JSON.parse(raw) };
  } catch {
    /* abaikan */
  }
  return { email: "", noHp: "", alamat: "" };
};

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
      email: extra.email || sessionEmail,
      noHp: extra.noHp,
      alamat: extra.alamat,
    };
  };

  const [form, setForm] = useState<ProfileForm>(buildForm);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");

  // Sinkronkan jika sesi berubah
  useEffect(() => {
    if (!editing) setForm(buildForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04] text-white",
        strong: "text-white",
        soft: "text-white/50",
        input:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-lime-300/60 focus:ring-lime-300/20 disabled:text-white/60",
        accent: "text-lime-300",
        ghost: "border-white/10 text-white/80 hover:bg-white/[0.06]",
        notice: "bg-lime-300/10 text-lime-300",
      }
    : {
        card: "border-slate-200 bg-white text-slate-800",
        strong: "text-slate-900",
        soft: "text-slate-500",
        input:
          "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-500/20 disabled:bg-slate-50 disabled:text-slate-600",
        accent: "text-lime-700",
        ghost: "border-slate-200 text-slate-700 hover:bg-slate-100",
        notice: "bg-lime-50 text-lime-700",
      };

  const initials = (form.nama || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    try {
      const { email, noHp, alamat } = form;
      localStorage.setItem(EXTRA_KEY, JSON.stringify({ email, noHp, alamat }));
      // TODO: panggil API update profil di sini
      setNotice("Profil berhasil disimpan.");
      setEditing(false);
    } catch {
      setNotice("Gagal menyimpan profil.");
    }
  };

  const handleCancel = () => {
    setForm(buildForm());
    setEditing(false);
    setNotice("");
  };

  const field = (
    name: keyof ProfileForm,
    label: string,
    Icon: typeof User,
    opts: { type?: string; textarea?: boolean; readOnly?: boolean } = {}
  ) => {
    const common = {
      name,
      value: form[name],
      onChange: handleChange,
      disabled: !editing || opts.readOnly,
      className: `w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 ${c.input}`,
    };
    return (
      <label className="block">
        <span className={`mb-1.5 block text-xs font-medium ${c.soft}`}>
          {label}
        </span>
        <span className="relative block">
          <Icon
            className={`pointer-events-none absolute left-4 top-3 h-4 w-4 ${c.soft}`}
          />
          {opts.textarea ? (
            <textarea rows={3} {...common} />
          ) : (
            <input type={opts.type ?? "text"} {...common} />
          )}
        </span>
      </label>
    );
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-6 lg:px-8">
      <div className={`rounded-2xl border p-6 ${c.card}`}>
        {/* Kepala profil */}
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-lime-300 text-xl font-bold text-[#10150c]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={`truncate text-xl font-semibold ${c.strong}`}>
              {form.nama || "Pengguna"}
            </h2>
            {roleText && (
              <p className={`text-sm font-medium ${c.accent}`}>{roleText}</p>
            )}
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setNotice("");
              }}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${c.ghost}`}
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}
        </div>

        {notice && (
          <p className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${c.notice}`}>
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama berasal dari sesi login, jadi hanya-baca */}
          {field("nama", "Nama Lengkap", User, { readOnly: true })}
          {field("email", "Email", Mail, { type: "email" })}
          {field("noHp", "No. HP", Phone, { type: "tel" })}
          {field("alamat", "Alamat", MapPin, { textarea: true })}

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