import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    mot_de_passe: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erreur lors de la connexion.");
      }

      // Enregistre le token
      if (data.data && data.data.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
      }

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10 bg-white">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-blue-900">Partaroute</h1>
        <p className="text-sm text-gray-500 mt-2">Connecte-toi à ton compte</p>
      </div>

      {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-lg"
        />
        <input
          type="password"
          name="mot_de_passe"
          placeholder="Mot de passe"
          value={formData.mot_de_passe}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-lg"
        />

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Connexion
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Pas encore de compte ?{" "}
        <a href="/register" className="text-blue-600 hover:underline">
          Inscription
        </a>
      </p>
    </div>
  );
}
