"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// -----------------------------
// TYPES
// -----------------------------
type NavbarClientProps = {
  initialUser: {
    id: string;
    email: string | null;
    user_metadata: any;
  } | null;
  initialHasSalon: boolean;
  initialHasVerkoper: boolean;
  initialDashboardUrl: string;
  initialDashboardLabel: string;
};

// -----------------------------
// COMPONENT
// -----------------------------
export default function NavbarClient({
  initialUser,
  initialHasSalon,
  initialHasVerkoper,
  initialDashboardUrl,
  initialDashboardLabel,
}: NavbarClientProps) {
  const supabase = createClientComponentClient();

  const [user, setUser] = useState(initialUser);
  const [hasSalon, setHasSalon] = useState(initialHasSalon);
  const [hasVerkoper, setHasVerkoper] = useState(initialHasVerkoper);
  const [dashboardUrl, setDashboardUrl] = useState(initialDashboardUrl);
  const [dashboardLabel, setDashboardLabel] = useState(initialDashboardLabel);

  // -----------------------------
  // REALTIME AUTH LISTENER
  // -----------------------------
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);

        if (!newUser) {
          // Uitgelogd
          setHasSalon(false);
          setHasVerkoper(false);
          setDashboardUrl("/account");
          setDashboardLabel("Mijn Account");
          return;
        }

        // Ingelogd → metadata
        const role = newUser.user_metadata?.role;

        if (role === "admin") {
          setDashboardUrl("/admin");
          setDashboardLabel("⚙️ Admin");
          return;
        }

        // Check salon
        const { data: salon } = await supabase
          .from("kapsalons")
          .select("id")
          .eq("owner_id", newUser.id)
          .maybeSingle();

        // Check verkoper
        const { data: verkoper } = await supabase
          .from("verkopers")
          .select("id")
          .eq("profile_id", newUser.id)
          .maybeSingle();

        setHasSalon(!!salon);
        setHasVerkoper(!!verkoper);

        if (verkoper) {
          setDashboardUrl("/verkoper/dashboard");
          setDashboardLabel("🏪 Verkoper Dashboard");
        }

        if (salon) {
          setDashboardUrl("/kapsalons/dashboard");
          setDashboardLabel("✂️ Salon Dashboard");
        }

        if (salon && verkoper) {
          setDashboardLabel("Dashboards ▾");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // -----------------------------
  // HELPERS
  // -----------------------------
  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  // -----------------------------
  // UI
  // -----------------------------
  if (!user) {
    return (
      <button
        onClick={() =>
          supabase.auth.signInWithOAuth({ provider: "google" })
        }
        className="px-4 py-2 rounded bg-orange-500 text-white"
      >
        Inloggen
      </button>
    );
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Gebruiker";

  const initials = getInitials(fullName);

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
        {initials}
      </div>

      <div className="flex flex-col">
        <span className="font-medium">{fullName}</span>
        <a
          href={dashboardUrl}
          className="text-sm text-gray-500 hover:underline"
        >
          {dashboardLabel}
        </a>
      </div>
    </div>
  );
}
