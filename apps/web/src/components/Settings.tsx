import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Bell, Eye, EyeOff, KeyRound, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

type ThemeValue = "light" | "dark";

// Konteks tema bisa menyediakan toggleTheme atau setTheme: dukung keduanya
interface ThemeCtx {
  theme: string;
  toggleTheme?: () => void;
  setTheme?: (t: ThemeValue) => void;
}

interface NotifPrefs {
  anggotaBaru: boolean;
  kas: boolean;
  kegiatan: boolean;
}

const NOTIF_KEY = "settings_notif";

const readNotif = (): NotifPrefs => {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw)
      return { anggotaBaru: true, kas: true, kegiatan: true, ...JSON.parse(raw) };
  } catch {
    /* abaikan */
  }
  return { anggotaBaru: true, kas: true, kegiatan: true };
};

export default function SettingsPage() {
  const themeCtx = useTheme() as unknown as ThemeCtx;
  const isDark = themeCtx.theme === "dark";

  const [notif, setNotif] = useState<NotifPrefs>(readNotif);
  const [pw, setPw] = useState({ lama: "", baru: "", konfirmasi: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const c = isDark
    ? {
        card: "border-white/10 bg-white/[0.04] text-white",
        strong: "text-white",
        soft: "text-white/50",
        input:
          "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-lime-300/60 focus:ring-lime-300/20",
        accent: "text-lime-300",
        divider: "border-white/10",
        option: "border-white/10 text-white/70 hover:bg-white/[0.06]",
        optionActive: "border-lime-300/60 bg-lime-300/10 text-lime-300",
        trackOff: "bg-white/15",
        okMsg: "bg-lime-300/10 text-lime-300",
        errMsg: "bg-red-500/10 text-red-400",
      }
    : {
        card: "border-slate-200 bg-white text-slate-800",
        strong: "text-slate-900",
        soft: "text-slate-500",
        input:
          "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-500/20",
        accent: "text-lime-700",
        divider: "border-slate-100",
        option: "border-slate-200 text-slate-600 hover:bg-slate-50",
        optionActive: "border-lime-500 bg-lime-50 text-lime-700",
        trackOff: "bg-slate-300",
        okMsg: "bg-lime-50 text-lime-700",
        errMsg: "bg-red-50 text-red-600",
      };

  const chooseTheme = (value: ThemeValue) => {
    if ((value === "dark") === isDark) return;
    if (themeCtx.setTheme) themeCtx.setTheme(value);
    else themeCtx.toggleTheme?.();
  };

  const toggleNotif = (key: keyof NotifPrefs) => {
    setNotif((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
      } catch {
        /* abaikan */
      }
      return next;
    });
  };

  const handlePassword = (e: FormEvent) => {
    e.preventDefault();
    if (pw.baru.length < 8) {
      setPwMsg({ ok: false, text: "Kata sandi baru minimal 8 karakter." });
      return;
    }
    if (pw.baru !== pw.konfirmasi) {
      setPwMsg({ ok: false, text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }
    // TODO: panggil API ganti kata sandi di sini
    setPwMsg({ ok: true, text: "Kata sandi berhasil diperbarui." });
    setPw({ lama: "", baru: "", konfirmasi: "" });
  };

  const Section = ({
    icon,
    title,
    desc,
    children,
  }: {
    icon: ReactNode;
    title: string;
    desc: string;
    children: ReactNode;
  }) => (
    <section className={`rounded-2xl border p-6 ${c.card}`}>
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime-300/15 text-lime-500">
          {icon}
        </span>
        <div>
          <h2 className={`text-base font-semibold ${c.strong}`}>{title}</h2>
          <p className={`text-sm ${c.soft}`}>{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );

  const Switch = ({
    checked,
    onChange,
    label,
    desc,
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
    desc: string;
  }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className={`text-sm font-medium ${c.strong}`}>{label}</p>
        <p className={`text-xs ${c.soft}`}>{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-lime-400" : c.trackOff
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );

  const inputCls = `w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${c.input}`;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-5 py-6 lg:px-8">
      {/* Tampilan */}
      <Section
        icon={<Palette className="h-5 w-5" />}
        title="Tampilan"
        desc="Pilih tema yang nyaman untuk mata Anda."
      >
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "light", label: "Terang", Icon: Sun },
              { value: "dark", label: "Gelap", Icon: Moon },
            ] as const
          ).map(({ value, label, Icon }) => {
            const active = (value === "dark") === isDark;
            return (
              <button
                key={value}
                type="button"
                onClick={() => chooseTheme(value)}
                aria-pressed={active}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  active ? c.optionActive : c.option
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Notifikasi */}
      <Section
        icon={<Bell className="h-5 w-5" />}
        title="Notifikasi"
        desc="Atur pemberitahuan yang ingin Anda terima."
      >
        <div className={`divide-y ${c.divider}`}>
          <Switch
            checked={notif.anggotaBaru}
            onChange={() => toggleNotif("anggotaBaru")}
            label="Pendaftaran anggota baru"
            desc="Kabari saat ada calon anggota yang mendaftar."
          />
          <Switch
            checked={notif.kas}
            onChange={() => toggleNotif("kas")}
            label="Kas masuk dan keluar"
            desc="Kabari saat ada transaksi kas tercatat."
          />
          <Switch
            checked={notif.kegiatan}
            onChange={() => toggleNotif("kegiatan")}
            label="Pengingat kegiatan"
            desc="Kabari sebelum kegiatan dimulai."
          />
        </div>
      </Section>

      {/* Keamanan */}
      <Section
        icon={<KeyRound className="h-5 w-5" />}
        title="Keamanan"
        desc="Ganti kata sandi akun Anda secara berkala."
      >
        <form onSubmit={handlePassword} className="space-y-4">
          {pwMsg && (
            <p
              className={`rounded-xl px-4 py-2.5 text-sm ${
                pwMsg.ok ? c.okMsg : c.errMsg
              }`}
            >
              {pwMsg.text}
            </p>
          )}

          {(
            [
              { key: "lama", label: "Kata sandi lama" },
              { key: "baru", label: "Kata sandi baru" },
              { key: "konfirmasi", label: "Konfirmasi kata sandi baru" },
            ] as const
          ).map(({ key, label }) => (
            <label key={key} className="block">
              <span className={`mb-1.5 block text-xs font-medium ${c.soft}`}>
                {label}
              </span>
              <input
                type={showPw ? "text" : "password"}
                value={pw[key]}
                onChange={(e) => setPw((p) => ({ ...p, [key]: e.target.value }))}
                required
                autoComplete={key === "lama" ? "current-password" : "new-password"}
                className={inputCls}
              />
            </label>
          ))}

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className={`flex items-center gap-2 text-sm font-medium ${c.accent}`}
            >
              {showPw ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showPw ? "Sembunyikan" : "Tampilkan"}
            </button>
            <button
              type="submit"
              className="rounded-full bg-lime-300 px-5 py-2.5 text-sm font-semibold text-[#10150c] transition-opacity hover:opacity-90"
            >
              Simpan Kata Sandi
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
}