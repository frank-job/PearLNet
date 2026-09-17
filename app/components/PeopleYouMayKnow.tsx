// components/PeopleYouMayKnow.tsx
"use client";

import { useState } from "react";
import { hashPhoneNumber } from "@/utils/crypto";

interface UserSuggestion {
  id: string;
  username: string;
}

export default function PeopleYouMayKnow({ currentUserId }: { currentUserId: string }) {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSyncContacts = async () => {
    setLoading(true);
    setStatusMessage("Accessing contacts...");

    try {
      let rawPhones: string[] = [];

      // Check if Web Contacts API is supported (Supported in Chrome Android / PWA)
      if ("contacts" in navigator && "ContactsManager" in window) {
        const props = ["tel"];
        const contacts = await (navigator as any).contacts.select(props, { multiple: true });
        
        contacts.forEach((contact: any) => {
          if (contact.tel) {
            rawPhones.push(...contact.tel);
          }
        });
      } else {
        // Fallback demo input if Web Contacts API is unsupported on desktop browsers
        const input = prompt("Enter phone numbers separated by commas (Fallback for desktop testing):");
        if (input) {
          rawPhones = input.split(",");
        }
      }

      if (rawPhones.length === 0) {
        setStatusMessage("No contacts selected.");
        setLoading(false);
        return;
      }

      setStatusMessage("Hashing and syncing securely...");

      // Hash all collected phone numbers using SHA-256
      const hashedContacts = await Promise.all(
        rawPhones.map((phone) => hashPhoneNumber(phone))
      );

      // Send hashes to backend
      const res = await fetch("/api/contacts/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, hashedContacts }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuggestions(data.suggestions || []);
        setStatusMessage(`Found ${data.matchesCount || 0} friends from your contacts!`);
      } else {
        setStatusMessage("Failed to sync contacts.");
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("An error occurred during sync.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">People You May Know</h2>
        <button
          onClick={handleSyncContacts}
          disabled={loading}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-semibold transition"
        >
          {loading ? "Syncing..." : "Sync Contacts"}
        </button>
      </div>

      {statusMessage && (
        <p className="text-xs text-slate-400 mb-3">{statusMessage}</p>
      )}

      <div className="space-y-3">
        {suggestions.length > 0 ? (
          suggestions.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-blue-400">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{user.username}</p>
                  <p className="text-xs text-slate-400">In your contacts</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-xs font-semibold">
                Connect
              </button>
            </div>
          ))
        ) : (
          !loading && (
            <p className="text-xs text-slate-500 text-center py-4">
              Sync your contacts to find friends on PearLNet.
            </p>
          )
        )}
      </div>
    </div>
  );
}