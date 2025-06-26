import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    mot_de_passe: "",
    confirmation: "",
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

    if (formData.mot_de_passe !== formData.confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          email: formData.email,
          mot_de_passe: formData.mot_de_passe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erreur lors de l'inscription.");
      }

      // Enregistrement du token (si login auto)
      if (data.data && data.data.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
      }

      navigate("/home"); // Redirection après inscription
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10 bg-white">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-blue-900">Partaroute</h1>
        <p className="text-sm text-gray-500 mt-2">Crée ton compte</p>
      </div>

      {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nom"
          placeholder="Ton nom"
          value={formData.nom}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-lg"
        />
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
        <input
          type="password"
          name="confirmation"
          placeholder="Confirmation"
          value={formData.confirmation}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-lg"
        />

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
}
