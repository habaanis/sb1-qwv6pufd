import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Tables } from "../lib/dbTables";

export default function SupabaseStatus() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from(Tables.ENTREPRISE).select("id").limit(1);
        if (error) throw error;
        setStatus("ok");
      } catch (err) {
        console.error("❌ Erreur de connexion Supabase :", err);
        setStatus("error");
      }
    };
    checkConnection();
  }, []);

  const getMessage = () => {
    switch (status) {
      case "ok":
        return (
          <div className="flex items-center gap-2 text-[#16A34A] font-medium">
            <span className="text-lg">✅</span>
            <span>Connexion Supabase active</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-[#D62828] font-medium">
            <span className="text-lg">❌</span>
            <span>Erreur de connexion Supabase</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-lg">⏳</span>
            <span>Vérification de la connexion...</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm z-50">
      {getMessage()}
    </div>
  );
}
