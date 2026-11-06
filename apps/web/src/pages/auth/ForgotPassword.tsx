import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    if (!validEmail(email)) {
      setError("Format email tidak valid.");
      return;
    }

    try {
      setLoading(true);
      // TODO: ganti dengan panggilan API reset password
      // await api.post("/auth/forgot-password", { email });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSent(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              ✉️
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Cek Email Anda</h1>
            <p className="text-gray-600 text-sm">
              Kami telah mengirim tautan untuk mengatur ulang kata sandi ke{" "}
              <span className="font-medium">{email}</span>. Jika tidak ada di kotak masuk, periksa folder spam.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Kirim ulang ke email lain
            </button>
            <div>
              <Link to="/login" className="text-sm text-gray-500 hover:underline">
                ← Kembali ke halaman login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-800">Lupa Kata Sandi?</h1>
              <p className="text-gray-500 text-sm mt-2">
                Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                    error ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-400"
                  }`}
                />
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Mengirim..." : "Kirim Tautan Reset"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-gray-500 hover:underline">
                ← Kembali ke halaman login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}