import React, { useState, useEffect, useMemo } from "react";
import { FreePracticeSource } from "../types";
import { apiFetch } from "../lib/api";
import { 
  Globe, 
  ExternalLink, 
  Search, 
  Terminal, 
  Database, 
  Code2, 
  Layers, 
  Star, 
  Check, 
  Copy, 
  PlusCircle, 
  X, 
  CheckCircle2, 
  Laptop,
  Loader2
} from "lucide-react";

interface CategoryStat {
  name: string;
  count: number;
}

export const FreePracticeSources: React.FC = () => {
  const [sources, setSources] = useState<FreePracticeSource[]>([]);
  const [, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyInteractive, setOnlyInteractive] = useState<boolean>(false);
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("practice_sources_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Copied link toast indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add source modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [newSource, setNewSource] = useState({
    name: "",
    category: "Algorithms & Data Structures",
    provider: "",
    description: "",
    url: "",
    difficulty: "All Levels" as "Beginner" | "Intermediate" | "Advanced" | "All Levels",
    features: "",
    recommendedTopics: "",
    cost: "100% Free",
    interactive: true,
    requiresAccount: false
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sourcesRes, categoriesRes] = await Promise.all([
        apiFetch("/api/v1/free-practice-sources"),
        apiFetch("/api/v1/free-practice-sources/categories")
      ]);

      if (!sourcesRes.ok) throw new Error("Failed to load practice sources");
      const data: FreePracticeSource[] = await sourcesRes.json();
      setSources(data);

      if (categoriesRes.ok) {
        const catData: CategoryStat[] = await categoriesRes.json();
        setCategories(catData);
      }
    } catch (err: any) {
      console.error("Error fetching practice sources:", err);
      setError(err.message || "Failed to load practice sources.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem("practice_sources_favorites", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newSource.name.trim() || !newSource.url.trim() || !newSource.description.trim()) {
      setFormError("Platform Name, URL, and Description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/v1/free-practice-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSource,
          features: newSource.features.split(",").map(f => f.trim()).filter(Boolean),
          recommendedTopics: newSource.recommendedTopics.split(",").map(t => t.trim()).filter(Boolean)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit source");
      }

      const createdSource: FreePracticeSource = await res.json();
      setSources(prev => [createdSource, ...prev]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowAddModal(false);
        setNewSource({
          name: "",
          category: "Algorithms & Data Structures",
          provider: "",
          description: "",
          url: "",
          difficulty: "All Levels",
          features: "",
          recommendedTopics: "",
          cost: "100% Free",
          interactive: true,
          requiresAccount: false
        });
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || "Failed to add source");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSources = useMemo(() => {
    return sources.filter(s => {
      if (selectedCategory !== "All" && s.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedDifficulty !== "All" && s.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }
      if (onlyInteractive && !s.interactive) {
        return false;
      }
      if (onlyFavorites && !favorites.includes(s.id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesDesc = s.description.toLowerCase().includes(q);
        const matchesProvider = s.provider.toLowerCase().includes(q);
        const matchesTopic = s.recommendedTopics.some(t => t.toLowerCase().includes(q));
        const matchesCategory = s.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesProvider && !matchesTopic && !matchesCategory) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      return bFav - aFav;
    });
  }, [sources, selectedCategory, selectedDifficulty, onlyInteractive, onlyFavorites, searchQuery, favorites]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Algorithms & Data Structures":
        return <Terminal size={14} className="text-emerald-600" />;
      case "Web Development":
        return <Code2 size={14} className="text-blue-600" />;
      case "Python & Scripting":
        return <Laptop size={14} className="text-indigo-600" />;
      case "Databases & SQL":
        return <Database size={14} className="text-amber-600" />;
      case "System Design & CS Fundamentals":
        return <Layers size={14} className="text-purple-600" />;
      default:
        return <Globe size={14} className="text-sky-600" />;
    }
  };

  return (
    <div className="space-y-7" id="free-practice-sources-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Curated Practice Hubs & Sandboxes
          </h1>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
              {sources.length} Open Platforms
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>In-browser IDEs, algorithmic challenges, and SQL database playgrounds</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <PlusCircle size={15} />
          <span>Suggest Source</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g., Python, SQL, Trees)..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              id="search-sources-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Quick Toggles */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner Friendly">Beginner Friendly</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>

            <button
              type="button"
              onClick={() => setOnlyInteractive(!onlyInteractive)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                onlyInteractive 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs" 
                  : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Terminal size={13} />
              <span>In-Browser IDE</span>
            </button>

            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                onlyFavorites 
                  ? "bg-amber-500 text-white border-amber-500 shadow-2xs" 
                  : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Star size={13} className={onlyFavorites ? "fill-white" : ""} />
              <span>Saved ({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* Category Segmented Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === "All"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Platforms ({sources.length})
          </button>

          {[
            "Algorithms & Data Structures",
            "Web Development",
            "Python & Scripting",
            "Databases & SQL",
            "System Design & CS Fundamentals"
          ].map(cat => {
            const count = sources.filter(s => s.category.toLowerCase() === cat.toLowerCase()).length;
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
                <span className={`text-[10px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-semibold">Loading curated practice hubs...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2 text-xs">
          <p className="text-rose-700 font-bold">{error}</p>
          <button
            type="button"
            onClick={fetchSources}
            className="px-4 py-2 bg-rose-700 text-white rounded-xl font-bold hover:bg-rose-800 cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Sources Grid */}
      {!loading && !error && (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing <strong className="text-slate-900 font-bold">{filteredSources.length}</strong> practice platforms</span>
            {(searchQuery || selectedCategory !== "All" || selectedDifficulty !== "All" || onlyInteractive || onlyFavorites) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setOnlyInteractive(false);
                  setOnlyFavorites(false);
                }}
                className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          {filteredSources.length === 0 ? (
            <div className="p-16 text-center bg-white border border-slate-200 rounded-2xl space-y-3 text-xs">
              <Search size={24} className="mx-auto text-slate-400" />
              <div className="font-bold text-slate-800 text-sm">No platforms match your criteria</div>
              <p className="text-slate-500 max-w-sm mx-auto">
                Try searching with broader terms or clearing category filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSources.map((source) => {
                const isFavorite = favorites.includes(source.id);
                return (
                  <div
                    key={source.id}
                    className={`bg-white border rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 transition-all ${
                      isFavorite 
                        ? "border-amber-300 bg-gradient-to-b from-white to-amber-50/20 shadow-xs ring-1 ring-amber-400/20" 
                        : "border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm"
                    }`}
                    id={`source-card-${source.id}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                            {source.category}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-600 font-medium">{source.difficulty}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(source.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isFavorite 
                              ? "text-amber-500 bg-amber-50" 
                              : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                          }`}
                          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                          id={`star-btn-${source.id}`}
                        >
                          <Star size={16} className={isFavorite ? "fill-amber-500" : ""} />
                        </button>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline focus:outline-none"
                          >
                            {source.name}
                          </a>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          Maintained by {source.provider}
                        </p>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed">
                        {source.description}
                      </p>

                      {/* Features */}
                      {source.features && source.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                          {source.features.map((feat, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700 font-medium">
                              <CheckCircle2 size={11} className="text-emerald-600" />
                              <span>{feat}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => copyUrl(source.id, source.url)}
                        className="px-3 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 font-semibold"
                      >
                        {copiedId === source.id ? (
                          <>
                            <Check size={13} className="text-emerald-600" />
                            <span className="text-emerald-800 font-bold">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        id={`launch-btn-${source.id}`}
                      >
                        <span>Open Sandbox</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Suggest Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Suggest Free Practice Source</h3>
                <p className="text-xs text-slate-500">Register an open-access platform or interactive resource</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {formError}
              </div>
            )}

            {submitSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-base">Practice Source Added</h4>
                <p className="text-xs text-slate-500">The platform has been cataloged in the open library.</p>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., CodeChef or LeetCode"
                    value={newSource.name}
                    onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={newSource.category}
                      onChange={(e) => setNewSource(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Algorithms & Data Structures">Algorithms & Data Structures</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Python & Scripting">Python & Scripting</option>
                      <option value="Databases & SQL">Databases & SQL</option>
                      <option value="System Design & CS Fundamentals">System Design & CS Fundamentals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                    <select
                      value={newSource.difficulty}
                      onChange={(e) => setNewSource(prev => ({ ...prev, difficulty: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="All Levels">All Levels</option>
                      <option value="Beginner">Beginner Friendly</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com"
                    value={newSource.url}
                    onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Provider</label>
                  <input
                    type="text"
                    placeholder="e.g., FreeCodeCamp Foundation"
                    value={newSource.provider}
                    onChange={(e) => setNewSource(prev => ({ ...prev, provider: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Brief summary of practice features and problem types..."
                    value={newSource.description}
                    onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Key Features (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., In-browser Python IDE, Test Cases, Solution Videos"
                    value={newSource.features}
                    onChange={(e) => setNewSource(prev => ({ ...prev, features: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : null}
                    <span>Submit Source</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
