"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const logout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/login";
};

type Bookmark = {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  last_visited?: string | null;
};

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");

  // ---------------- LOGIN + REALTIME ----------------
  useEffect(() => {
    let channel: any;

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setUser(session.user);
      fetchBookmarks(session.user.id);

      // REALTIME (IMPORTANT FIX)
      channel = supabase
        .channel("bookmarks-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
          },
          (payload) => {
            // refresh only when something actually changes
            fetchBookmarks(session.user.id);
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // ---------------- FETCH ----------------
  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) setBookmarks(data);
  };

  // ---------------- VISIT BOOKMARK (THE MAIN FIX) ----------------
  const openBookmark = async (bookmark: Bookmark) => {

    // optimistic UI update (instant change without waiting realtime)
    setBookmarks(prev =>
      prev.map(b =>
        b.id === bookmark.id
          ? { ...b, last_visited: new Date().toISOString() }
          : b
      )
    );

    // update database
    await supabase
      .from("bookmarks")
      .update({ last_visited: new Date().toISOString() })
      .eq("id", bookmark.id);

    // open site
    window.open(bookmark.url, "_blank");
  };

  // ---------------- ADD ----------------
  const addBookmark = async () => {
    if (!url) return;

    try {
      const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
      const hostname = parsedUrl.hostname.replace("www.", "");
      const autoTitle = title || hostname;
      const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;

      const { error } = await supabase.from("bookmarks").insert({
        title: autoTitle,
        url: parsedUrl.href,
        favicon: favicon,
        user_id: user.id,
      });

      if (error) {
        alert("Could not add bookmark");
        return;
      }

      setTitle("");
      setUrl("");
      fetchBookmarks(user.id);

    } catch {
      alert("Please enter a valid URL");
    }
  };

  // ---------------- DELETE ----------------
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    fetchBookmarks(user.id);
  };

  if (!user) return <div className="p-10">Loading...</div>;

  // ---------------- SEARCH ----------------
  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-extrabold tracking-tight">
          Smart<span className="text-indigo-600">Bookmark</span>
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="max-w-3xl mx-auto p-6">

        {/* ADD BOOKMARK */}
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-4 text-gray-700">Add Bookmark</h2>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Website title"
              className="border rounded-lg p-2 w-1/3 focus:ring-2 focus:ring-indigo-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="text"
              placeholder="https://example.com"
              className="border rounded-lg p-2 w-2/3 focus:ring-2 focus:ring-indigo-400"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              onClick={addBookmark}
              className="bg-indigo-600 text-white px-5 rounded-lg hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* BOOKMARK LIST */}
        <div className="grid gap-4">

          {filteredBookmarks.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              No results found 🔍
            </div>
          )}

          {filteredBookmarks.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow p-4 flex justify-between items-center hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={b.favicon || "https://www.google.com/favicon.ico"}
                  className="w-8 h-8 rounded"
                />

                <div>
                  <button
                    onClick={() => openBookmark(b)}
                    className="text-lg font-semibold text-indigo-600 hover:underline text-left"
                  >
                    {b.title}
                  </button>

                  <p className="text-sm text-gray-500">{b.url}</p>

                  <p className="text-xs text-gray-400">
                    {b.last_visited
                      ? `Visited ${new Date(b.last_visited).toLocaleString()}`
                      : "Never visited"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">

                {/* OPEN */}
                <button
                  onClick={() => openBookmark(b)}
                  className="text-gray-500 hover:text-indigo-600"
                >
                  ↗
                </button>

                {/* COPY */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(b.url);
                    alert("Link copied!");
                  }}
                  className="text-gray-500 hover:text-indigo-600"
                >
                  📋
                </button>

                {/* DELETE */}
                <button
                  onClick={() => deleteBookmark(b.id)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
