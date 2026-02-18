"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const logout= async()=>{
    await supabase.auth.signOut();
    window.location.href = "/login";
}

type Bookmark = {
  id: string;
  title: string;
  url: string;
  favicon?: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");

  // check login
    useEffect(() => {
    let channel: any;

    const setup = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        // If not logged in → go to login immediately
        if (!session) {
        router.replace("/login");
        return;
        }

        setUser(session.user);
        fetchBookmarks(session.user.id);

        // realtime listener
        channel = supabase
        .channel("bookmarks-realtime")
        .on(
            "postgres_changes",
            {
            event: "*",
            schema: "public",
            table: "bookmarks",
            },
            () => {
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



  // fetch bookmarks
  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookmarks(data);
    }
  };

  // add bookmark
    const addBookmark = async () => {
    if (!url) return;

    try {
        // parse URL
        const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);

        const hostname = parsedUrl.hostname.replace("www.", "");

        // auto title if empty
        const autoTitle = title || hostname;

        // Google favicon API
        const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;

        const { error } = await supabase.from("bookmarks").insert({
        title: autoTitle,
        url: parsedUrl.href,
        favicon: favicon,
        user_id: user.id,
        });

        if (error) {
        console.error(error);
        alert("Could not add bookmark");
        return;
        }

        setTitle("");
        setUrl("");
        fetchBookmarks(user.id);

    } catch (err) {
        alert("Please enter a valid URL");
    }
    };


  // delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    fetchBookmarks(user.id);
  };

  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">

         {/* Navbar */}
        <div className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-xl font-extrabold tracking-tight">Smart<span className="text-indigo-600">Bookmark</span></h1>

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

        {/* Search Bar */}
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

            {/* Add Bookmark Card */}
            <div className="bg-white p-5 rounded-xl shadow mb-6">
            <h2 className="font-semibold mb-4 text-gray-700">Add Bookmark</h2>

            <div className="flex gap-3">
                <input
                type="text"
                placeholder="Website title"
                className="border rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />

                <input
                type="text"
                placeholder="https://example.com"
                className="border rounded-lg p-2 w-2/3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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

            {/* Bookmarks */}
            <div className="grid gap-4">
            {bookmarks
                .filter((b) =>
                    b.title.toLowerCase().includes(search.toLowerCase()) ||
                    b.url.toLowerCase().includes(search.toLowerCase())
                )
                .map((b) => (
                <div
                key={b.id}
                className="bg-white rounded-xl shadow p-4 flex justify-between items-center hover:shadow-lg transition"
                >
                <div>
                    <div className="flex items-center gap-3">
                    <img
                        src={b.favicon || "https://www.google.com/favicon.ico"}
                        className="w-8 h-8 rounded"
                    />

                    <div>
                        <a
                        href={b.url}
                        target="_blank"
                        className="text-lg font-semibold text-indigo-600 hover:underline"
                        >
                        {b.title}
                        </a>
                        <p className="text-sm text-gray-500">{b.url}</p>
                    </div>
                    </div>

                </div>

                <div className="flex items-center gap-4">

                {/* Open in new tab */}
                <a
                    href={b.url}
                    target="_blank"
                    title="Open"
                    className="text-gray-500 hover:text-indigo-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M14 3h7m0 0v7m0-7L10 14M5 5v14h14" />
                    </svg>
                </a>

                {/* Copy link */}
                <button
                    onClick={() => {
                    navigator.clipboard.writeText(b.url);
                    alert("Link copied!");
                    }}
                    title="Copy link"
                    className="text-gray-500 hover:text-indigo-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16h8M8 12h8m-6 8h6a2 2 0 002-2V6a2 2 0 00-2-2h-6l-4 4v10a2 2 0 002 2z" />
                    </svg>
                </button>

                {/* Delete */}
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
