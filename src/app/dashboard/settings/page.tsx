"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Settings, LogOut, User, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="max-w-2xl mx-auto fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account</p>
      </div>

      {/* Profile Card */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          Profile
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {session?.user?.name
              ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              : session?.user?.email?.[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white text-lg">
              {session?.user?.name ?? "User"}
            </p>
            <p className="text-slate-400 text-sm">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Account
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Session</p>
              <p className="text-xs text-slate-400 mt-0.5">
                You are currently signed in
              </p>
            </div>
            <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              Active
            </span>
          </div>

          <button
            onClick={() => toast("Password change coming soon!", { icon: "🚧" })}
            className="w-full flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800/60 rounded-xl transition-all text-left"
          >
            <div>
              <p className="text-sm font-medium text-white">Change Password</p>
              <p className="text-xs text-slate-400 mt-0.5">Update your password</p>
            </div>
            <span className="text-slate-500 text-sm">→</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-2xl p-6 border border-red-500/10">
        <h2 className="text-base font-semibold text-red-400 mb-4 flex items-center gap-2">
          <LogOut className="w-5 h-5" />
          Sign Out
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          You&apos;ll be redirected to the login page.
        </p>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl transition-all disabled:opacity-60"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Sign out
        </button>
      </div>
    </div>
  );
}
