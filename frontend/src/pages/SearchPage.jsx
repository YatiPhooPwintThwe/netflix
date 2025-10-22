// src/pages/SearchPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/navigation.jsx";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axiosInstance.js";
import { ORIGINAL_IMG_BASE_URL } from "../utils/constants.js";
import { useContentStore } from "../store/useContentStore.js";
import { upsertClientHistory } from "../utils/clientHistory.js";

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState("movie"); // 'movie' | 'tv' | 'person'
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const { setContentType } = useContentStore();
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setContentType(tab === "person" ? "person" : tab); // keep store in sync
    setResults([]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    try {
      const res = await axiosInstance.get(
        `/api/v1/search/${activeTab}/${encodeURIComponent(searchTerm.trim())}`
      );
      setResults(res.data.content || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        toast.error("Nothing found, make sure you’re in the right category.");
      } else {
        toast.error("An error occurred, please try again later");
      }
      setResults([]);
    }
  };

  const openItem = (result) => {
    // Save the clicked item to client history (so UI reflects what user chose)
    const payload =
      activeTab === "person"
        ? {
            id: result.id,
            title: result.name,
            image: result.profile_path,
            searchType: "person",
          }
        : {
            id: result.id,
            title: result.title || result.name,
            image: result.poster_path,
            searchType: activeTab, // 'movie' | 'tv'
          };
    upsertClientHistory(payload);

    // Best-effort: remove server’s auto-saved “first result” to avoid duplicate feel
    const first = results?.[0];
    if (first && typeof first.id === "number") {
      axiosInstance.delete(`/api/v1/search/history/${first.id}`).catch(() => {});
    }

    // Navigate
    if (activeTab === "person") {
      toast("Saved to history (person).");
      return;
    }
    navigate(`/watch/${activeTab}/${result.id}`);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            className={`py-2 px-4 rounded ${
              activeTab === "movie" ? "bg-red-600" : "bg-gray-800"
            } hover:bg-red-700`}
            onClick={() => handleTabClick("movie")}
          >
            Movies
          </button>
          <button
            className={`py-2 px-4 rounded ${
              activeTab === "tv" ? "bg-red-600" : "bg-gray-800"
            } hover:bg-red-700`}
            onClick={() => handleTabClick("tv")}
          >
            TV Shows
          </button>
          <button
            className={`py-2 px-4 rounded ${
              activeTab === "person" ? "bg-red-600" : "bg-gray-800"
            } hover:bg-red-700`}
            onClick={() => handleTabClick("person")}
          >
            Person
          </button>
        </div>

        {/* Search */}
        <form
          className="flex gap-2 items-stretch mb-8 max-w-2xl mx-auto"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search for a ${activeTab}`}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
            aria-label="Search"
          >
            <Search className="size-6" />
          </button>
        </form>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((result) => {
            const img = result.poster_path || result.profile_path;
            if (!img) return null;

            return (
              <button
                key={`${activeTab}-${result.id}`}
                className="bg-gray-800 p-4 rounded text-left hover:bg-gray-700 transition"
                onClick={() => openItem(result)}
              >
                <img
                  src={ORIGINAL_IMG_BASE_URL + img}
                  alt={result.title || result.name}
                  className="w-full h-auto rounded"
                />
                <h2 className="mt-2 text-xl font-bold truncate">
                  {result.title || result.name}
                </h2>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
