import axiosInstance from "../lib/axiosInstance.js";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../component/navigation.jsx";
import { SMALL_IMG_BASE_URL } from "../utils/constants.js";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import {
  loadClientHistory,
  removeClientHistoryById,
} from "../utils/clientHistory.js";

function formatDate(dateString) {
  const d = new Date(dateString);
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${m[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function posterSrc(image) {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return SMALL_IMG_BASE_URL + image;
}

// Pick newest when same id appears in both client & server
function mergeHistory(serverList, clientList) {
  const byId = new Map();
  for (const s of serverList) byId.set(s.id, { ...s, clientOnly: false });
  for (const c of clientList) byId.set(c.id, { ...c, clientOnly: true });
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export default function SearchHistoryPage() {
  const [serverHistory, setServerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientHistory, setClientHistory] = useState([]);

  useEffect(() => {
    setClientHistory(loadClientHistory());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/api/v1/search/history");
        setServerHistory(Array.isArray(res.data?.content) ? res.data.content : []);
      } catch (err) {
        console.error("getSearchHistory failed:", err);
        toast.error("Failed to load search history");
        setServerHistory([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const history = useMemo(
    () => mergeHistory(serverHistory, clientHistory),
    [serverHistory, clientHistory]
  );

  const handleDelete = async (entry) => {
    try {
      if (entry.clientOnly) {
        // remove from client overlay only
        removeClientHistoryById(entry.id);
        setClientHistory(loadClientHistory());
      } else {
        await axiosInstance.delete(`/api/v1/search/history/${entry.id}`);
        setServerHistory((prev) => prev.filter((x) => x.id !== entry.id));
        // also remove any matching client overlay if present
        removeClientHistoryById(entry.id);
        setClientHistory(loadClientHistory());
      }
      toast.success("Removed from history");
    } catch (err) {
      console.error("delete history failed:", err);
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Search History</h1>
          <div className="flex justify-center items-center h-96">
            <p className="text-xl">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Search History</h1>
          <div className="flex justify-center items-center h-96">
            <p className="text-xl">No search history found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search History</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((entry) => {
            // unique key: prefer createdAt+id combo
            const key = `${entry.id}-${new Date(entry.createdAt).getTime()}`;
            const src = posterSrc(entry.image);

            return (
              <div key={key} className="bg-gray-800 p-4 rounded flex items-start gap-4">
                {src ? (
                  <img
                    src={src}
                    alt={entry.title || "Poster"}
                    className="w-16 h-16 rounded-full object-cover shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-zinc-700 grid place-items-center shrink-0">
                    <span className="text-xs text-zinc-300">No image</span>
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <span className="text-white text-lg truncate">{entry.title}</span>
                  <span className="text-gray-400 text-sm">{formatDate(entry.createdAt)}</span>
                </div>

                <span
                  className={`py-1 px-3 min-w-20 text-center rounded-full text-sm ml-auto ${
                    entry.searchType === "movie"
                      ? "bg-red-600"
                      : entry.searchType === "tv"
                      ? "bg-blue-600"
                      : "bg-green-600"
                  }`}
                  title={entry.clientOnly ? "Saved from click (client)" : "Saved by server"}
                >
                  {entry.searchType
                    ? entry.searchType[0].toUpperCase() + entry.searchType.slice(1)
                    : "Unknown"}
                </span>

                <button
                  className="ml-3 p-1 rounded hover:bg-zinc-700"
                  title="Remove"
                  onClick={() => handleDelete(entry)}
                >
                  <Trash className="size-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
