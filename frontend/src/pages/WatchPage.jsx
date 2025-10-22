// WatchPage.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../component/navigation.jsx";
import axiosInstance from "../lib/axiosInstance.js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import YouTube from "react-youtube";
import { ORIGINAL_IMG_BASE_URL, SMALL_IMG_BASE_URL } from "../utils/constants.js";
import { formatReleaseDate } from "../utils/dateFunction.js";
import WatchPageSkeleton from "../component/skeletons/WatchPageSkeleton.jsx";

const WatchPage = () => {
  const { type, id } = useParams(); // 'movie' | 'tv'

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [similarContent, setSimilarContent] = useState([]);

  const [trailers, setTrailers] = useState([]);
  const [currentTrailerIdx, setCurrentTrailerIdx] = useState(0);
  const [playerError, setPlayerError] = useState(false);

  const sliderRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setContent(null);
    setSimilarContent([]);
    setTrailers([]);
    setCurrentTrailerIdx(0);
    setPlayerError(false);
  }, [type, id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/${type}/${id}/trailers`);
        const all = res.data?.trailers || [];
        const prio = { Trailer: 3, Teaser: 2, Clip: 1, Featurette: 0 };
        const yt = all
          .filter((v) => v?.site === "YouTube" && v?.key)
          .sort(
            (a, b) =>
              (prio[b?.type] ?? -1) - (prio[a?.type] ?? -1) ||
              Number(!!b?.official) - Number(!!a?.official)
          );
        if (!cancelled) setTrailers(yt);
      } catch {
        if (!cancelled) setTrailers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/${type}/${id}/similar`);
        if (!cancelled) setSimilarContent(res.data?.similar || []);
      } catch {
        if (!cancelled) setSimilarContent([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/${type}/${id}/details`);
        if (!cancelled) setContent(res.data?.content || null);
      } catch {
        if (!cancelled) setContent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  useEffect(() => {
    setCurrentTrailerIdx(0);
    setPlayerError(false);
  }, [trailers]);

  useEffect(() => {
    setPlayerError(false);
  }, [currentTrailerIdx]);

  const tryNextTrailer = () => {
    setPlayerError(false);
    setCurrentTrailerIdx((i) => (i < trailers.length - 1 ? i + 1 : i));
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  const ytOpts = {
    playerVars: {
      modestbranding: 1,
      rel: 0,
      fs: 1,
      origin: window.location.origin,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-10">
        <WatchPageSkeleton />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="mx-auto container px-4 py-6">
          <Navbar />
        </div>
        <div className="text-center mx-auto px-4 py-8 mt-20">
          <h2 className="text-2xl sm:text-5xl font-bold text-balance">Content not found 😥</h2>
        </div>
      </div>
    );
  }

  const title = content?.title || content?.name || "Untitled";
  const releaseDate = content?.release_date || content?.first_air_date || null;
  const posterSrc = content?.poster_path ? ORIGINAL_IMG_BASE_URL + content.poster_path : null;
  const currentTrailer = trailers[currentTrailerIdx];

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Header */}
      <div className="mx-auto container px-4 py-6">
        <Navbar />
      </div>

      {/* Player section: full height, width between chevrons */}
      <section className="w-screen pb-8 md:pb-14 mb-0">
        {/* Make the whole section nearly full screen (adjust 100px to your header height) */}
        <div className="relative min-h-[calc(100vh-100px)]">
          {/* Chevrons */}
          <button
            className={`absolute left-4 md:left-10 top-1/2 -translate-y-1/2
                        flex items-center justify-center size-12 rounded-full
                        bg-gray-500/70 hover:bg-gray-500 text-white
                        ${currentTrailerIdx === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={currentTrailerIdx === 0}
            onClick={() => setCurrentTrailerIdx((i) => Math.max(0, i - 1))}
            aria-label="Previous trailer"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            className={`absolute right-4 md:right-10 top-1/2 -translate-y-1/2
                        flex items-center justify-center size-12 rounded-full
                        bg-gray-500/70 hover:bg-gray-500 text-white
                        ${currentTrailerIdx === trailers.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={currentTrailerIdx === trailers.length - 1}
            onClick={() =>
              setCurrentTrailerIdx((i) => Math.min(trailers.length - 1, i + 1))
            }
            aria-label="Next trailer"
          >
            <ChevronRight size={24} />
          </button>

          {/* Absolute player wrapper fills vertical space and sits between chevrons */}
          <div className="absolute inset-y-0 left-20 right-20 md:left-28 md:right-28">
            {trailers.length > 0 ? (
              <>
                <YouTube
                  videoId={currentTrailer.key}
                  // IMPORTANT: use className (wrapper div), not containerClassName
                  className="w-full h-full absolute inset-0"
                  iframeClassName="w-full h-full rounded-2xl overflow-hidden"
                  opts={ytOpts}
                  onError={() => {
                    if (currentTrailerIdx < trailers.length - 1) tryNextTrailer();
                    else setPlayerError(true);
                  }}
                  onReady={(e) => {
                    const player = e.target;
                    const t = setTimeout(() => {
                      const d = player.getDuration?.() || 0;
                      if (!d) {
                        if (currentTrailerIdx < trailers.length - 1) tryNextTrailer();
                        else setPlayerError(true);
                      }
                    }, 3000);
                    return () => clearTimeout(t);
                  }}
                />
                {playerError && (
                  <div className="text-center mt-3">
                    <p className="text-sm text-zinc-400 mb-2">This video can’t play here.</p>
                    <a
                      className="inline-block underline text-blue-400 hover:text-blue-300"
                      href={`https://www.youtube.com/watch?v=${currentTrailer.key}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on YouTube
                    </a>
                  </div>
                )}
              </>
            ) : (
              <h2 className="text-xl text-center mt-5">
                No trailers available for <span className="font-bold text-red-600">{title}</span> 😥
              </h2>
            )}
          </div>
        </div>
      </section>

      {/* Details & Similar */}
      <div className="mx-auto container px-4 pb-12 mt-10 md:mt-16">
        {/* Details */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-20 max-w-6xl mx-auto">
          <div className="mb-4 md:mb-0">
            <h2 className="text-5xl font-bold text-balance">{title}</h2>

            <p className="mt-2 text-lg">
              {releaseDate ? formatReleaseDate(releaseDate) : "Unknown date"} {" | "}
              {content?.adult ? (
                <span className="text-red-600">18+</span>
              ) : (
                <span className="text-green-600">PG-13</span>
              )}
            </p>

            <p className="mt-4 text-lg">{content?.overview || "No overview available."}</p>
          </div>

          {posterSrc ? (
            <img src={posterSrc} alt="Poster image" className="max-h-[600px] rounded-md" />
          ) : (
            <div className="w-[400px] h-[600px] rounded-md bg-zinc-800 grid place-items-center">
              <span className="text-zinc-400">No poster</span>
            </div>
          )}
        </div>

        {/* Similar */}
        {similarContent.length > 0 && (
          <div className="mt-12 max-w-5xl mx-auto relative">
            <h3 className="text-3xl font-bold mb-4">Similar {type === "tv" ? "TV Shows" : "Movies"}</h3>

            <div className="flex overflow-x-scroll scrollbar-hide gap-4 pb-4 group" ref={sliderRef}>
              {similarContent.map((item) => {
                if (!item?.poster_path) return null;
                return (
                  <Link key={item.id} to={`/watch/${type}/${item.id}`} className="w-52 flex-none">
                    <img
                      src={SMALL_IMG_BASE_URL + item.poster_path}
                      alt={`${item.title || item.name} poster`}
                      className="w-full h-auto rounded-md"
                      loading="lazy"
                    />
                    <h4 className="mt-2 text-lg font-semibold truncate">{item.title || item.name}</h4>
                  </Link>
                );
              })}

              <ChevronRight
                className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8
                           opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer
                           bg-red-600 text-white rounded-full"
                onClick={scrollRight}
                role="button"
                aria-label="Scroll similar right"
                tabIndex={0}
              />
              <ChevronLeft
                className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8
                           opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer
                           bg-red-600 text-white rounded-full"
                onClick={scrollLeft}
                role="button"
                aria-label="Scroll similar left"
                tabIndex={0}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPage;
