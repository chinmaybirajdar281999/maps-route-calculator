import { useState, useRef, useEffect, useCallback } from "react";
import {
  MapPin,
  Navigation,
  DollarSign,
  Clock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Route,
  History,
  Car,
  Truck,
  Bus,
  Bike,
  ArrowUpDown,
  BarChart3,
  Fuel,
  ShieldOff,
  Plus,
  X,
  GripVertical,
  Activity,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || "";
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
if (!mapboxgl.accessToken) {
  console.error(
    "Mapbox access token is missing. Set REACT_APP_MAPBOX_TOKEN in frontend/.env."
  );
}

async function geocodeLocation(location) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    throw new Error(`Location "${location}" not found`);
  } catch (error) {
    console.error(`Geocoding error for ${location}:`, error);
    throw error;
  }
}

async function fetchPlaceSuggestions(query) {
  if (!query || query.length < 3) return [];
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5`
    );
    const data = await response.json();
    return (data.features || []).map((f) => f.place_name);
  } catch {
    return [];
  }
}

function sortRoutes(routesToSort, mode) {
  if (!Array.isArray(routesToSort)) return [];
  return [...routesToSort].sort((a, b) => {
    if (mode === "shortest") return a.distance - b.distance;
    if (mode === "lowestToll") return a.totalTollCost - b.totalTollCost;
    return a.duration - b.duration;
  });
}

function buildHistoryItem(sourceValue, destinationValue, vehicle) {
  return {
    id: `${sourceValue}|${destinationValue}|${vehicle}`,
    source: sourceValue,
    destination: destinationValue,
    vehicleType: vehicle,
    createdAt: new Date().toISOString(),
  };
}

function saveRouteHistory(history) {
  localStorage.setItem("routeHistory", JSON.stringify(history));
}

const VEHICLE_ICONS = { car: Car, truck: Truck, bus: Bus, motorcycle: Bike };

/* ─── Skeleton Components ─── */
function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/50">
      <div className="skeleton h-3 w-20 rounded mb-3" />
      <div className="skeleton h-7 w-28 rounded mb-2" />
      <div className="skeleton h-2 w-16 rounded" />
    </div>
  );
}

function SkeletonBar() {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-5 flex-1 rounded" />
      <div className="skeleton h-3 w-12 rounded" />
    </div>
  );
}

/* ─── Animated Metric Card ─── */
function MetricCard({ icon: Icon, label, value, unit, color, delay = 0 }) {
  const colorMap = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
    green:
      "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
    amber:
      "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
    purple:
      "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400",
  };
  const iconColorMap = {
    blue: "text-blue-400",
    green: "text-emerald-400",
    amber: "text-amber-400",
    purple: "text-purple-400",
  };

  return (
    <div
      className={`metric-card p-4 rounded-xl bg-gradient-to-br ${colorMap[color]} border animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColorMap[color]}`} />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-2xl font-bold ${iconColorMap[color]} animate-count-up`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs text-slate-500 font-medium">{unit}</span>
        )}
      </div>
    </div>
  );
}

/* ─── Toll Bar Chart ─── */
function TollBarChart({ tolls }) {
  if (!tolls || tolls.length === 0) return null;
  const maxCharge = Math.max(...tolls.map((t) => t.chargeInr || t.charge * 83));

  return (
    <div className="space-y-2">
      {tolls.map((toll, idx) => {
        const charge =
          typeof toll.chargeInr === "number"
            ? toll.chargeInr
            : toll.charge * 83;
        const pct = maxCharge > 0 ? (charge / maxCharge) * 100 : 0;
        return (
          <div key={idx} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 truncate max-w-[140px]">
                {toll.name}
              </span>
              <span className="text-xs font-semibold text-amber-400">
                ₹{charge.toFixed(0)}
              </span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 toll-bar"
                style={{ "--bar-width": `${pct}%`, animationDelay: `${idx * 100}ms` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {toll.location}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Route Comparison Table ─── */
function RouteComparisonTable({ routes, selectedId, onSelect }) {
  if (!routes || routes.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-500 border-b border-slate-700/50">
            <th className="text-left py-2 px-2 font-medium">Route</th>
            <th className="text-right py-2 px-2 font-medium">Distance</th>
            <th className="text-right py-2 px-2 font-medium">ETA</th>
            <th className="text-right py-2 px-2 font-medium">Toll</th>
            <th className="text-right py-2 px-2 font-medium">Fuel</th>
            <th className="text-right py-2 px-2 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => {
            const hasTraffic = route.durationTraffic != null;
            const displayDur = hasTraffic ? route.durationTraffic : route.duration;
            return (
              <tr
                key={route.id}
                onClick={() => onSelect(route)}
                className={`cursor-pointer transition-colors border-b border-slate-700/30 ${
                  selectedId === route.id
                    ? "bg-blue-500/10 text-blue-300"
                    : "text-slate-300 hover:bg-slate-700/30"
                }`}
              >
                <td className="py-2.5 px-2 font-medium">Route {route.id + 1}</td>
                <td className="py-2.5 px-2 text-right">
                  {route.distance.toFixed(1)} km
                </td>
                <td className="py-2.5 px-2 text-right">
                  <span>{Math.floor(displayDur / 3600) > 0 ? `${Math.floor(displayDur / 3600)}h ${Math.floor((displayDur % 3600) / 60)}m` : `${Math.floor(displayDur / 60)} min`}</span>
                  {hasTraffic && (
                    <span className="block text-[9px] text-orange-400/70">with traffic</span>
                  )}
                </td>
                <td className="py-2.5 px-2 text-right font-semibold text-amber-400">
                  ₹{route.totalTollCost.toFixed(0)}
                </td>
                <td className="py-2.5 px-2 text-right text-emerald-400">
                  ₹{(route.fuelCost || 0).toFixed(0)}
                </td>
                <td className="py-2.5 px-2 text-right font-bold text-blue-400">
                  ₹{(route.totalTripCost || 0).toFixed(0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*               MAIN APP                     */
/* ═══════════════════════════════════════════ */
export default function RouteTollApp() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [waypoints, setWaypoints] = useState([]); // [{text, suggestions}]
  const [vehicleType, setVehicleType] = useState("car");
  const [filterMode, setFilterMode] = useState("fastest");
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [sortedRoutes, setSortedRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [error, setError] = useState(null);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routeHistory, setRouteHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("routeHistory") || "[]");
    } catch {
      return [];
    }
  });

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);
  const sidebarRef = useRef(null);

  /* ─── Map drawing helpers ─── */
  function drawRoute(coordinates) {
    try {
      if (!coordinates || coordinates.length === 0) return;
      const geojson = {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates },
      };
      if (mapRef.current.getSource("route")) {
        mapRef.current.getSource("route").setData(geojson);
      } else {
        mapRef.current.addSource("route", { type: "geojson", data: geojson });
        mapRef.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#6366f1",
            "line-width": 5,
            "line-opacity": 0.85,
          },
        });
      }
    } catch (err) {
      console.error("Error drawing route:", err);
    }
  }

  function clearTollMarkers() {
    if (mapRef.current && mapRef.current.getSource("toll-markers")) {
      mapRef.current
        .getSource("toll-markers")
        .setData({ type: "FeatureCollection", features: [] });
    }
  }

  const showTollMarkers = useCallback((route) => {
    if (!mapRef.current || !route || !Array.isArray(route.tolls)) return;
    clearTollMarkers();
    const features = route.tolls.map((toll) => ({
      type: "Feature",
      properties: {
        title: toll.name,
        description: `${toll.location} — ₹${Number(toll.chargeInr).toFixed(2)}`,
      },
      geometry: { type: "Point", coordinates: toll.coordinates },
    }));
    const geojson = { type: "FeatureCollection", features };
    if (mapRef.current.getSource("toll-markers")) {
      mapRef.current.getSource("toll-markers").setData(geojson);
    } else {
      mapRef.current.addSource("toll-markers", { type: "geojson", data: geojson });
      mapRef.current.addLayer({
        id: "toll-markers",
        type: "circle",
        source: "toll-markers",
        paint: {
          "circle-radius": 7,
          "circle-color": "#f59e0b",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#1e293b",
        },
      });
    }
  }, []);

  /* ─── Input handlers ─── */
  function handleLocationChange(field, value) {
    if (field === "source") {
      setSource(value);
      setSourceSuggestions([]);
    } else {
      setDestination(value);
      setDestinationSuggestions([]);
    }
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    suggestionTimeoutRef.current = setTimeout(async () => {
      const suggestions = await fetchPlaceSuggestions(value);
      if (field === "source") setSourceSuggestions(suggestions);
      else setDestinationSuggestions(suggestions);
    }, 250);
  }

  function handleSuggestionSelect(field, suggestion) {
    if (field === "source") {
      setSource(suggestion);
      setSourceSuggestions([]);
    } else {
      setDestination(suggestion);
      setDestinationSuggestions([]);
    }
  }

  /* ─── Waypoint helpers ─── */
  function addWaypoint() {
    if (waypoints.length >= 10) return;
    setWaypoints((prev) => [...prev, { text: "", suggestions: [] }]);
  }

  function removeWaypoint(index) {
    setWaypoints((prev) => prev.filter((_, i) => i !== index));
  }

  function handleWaypointChange(index, value) {
    setWaypoints((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text: value, suggestions: [] };
      return next;
    });
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    suggestionTimeoutRef.current = setTimeout(async () => {
      const suggestions = await fetchPlaceSuggestions(value);
      setWaypoints((prev) => {
        const next = [...prev];
        if (next[index]) next[index] = { ...next[index], suggestions };
        return next;
      });
    }, 250);
  }

  function handleWaypointSuggestionSelect(index, suggestion) {
    setWaypoints((prev) => {
      const next = [...prev];
      next[index] = { text: suggestion, suggestions: [] };
      return next;
    });
  }

  function updateSortedRoutes(routesToUpdate, mode) {
    const sorted = sortRoutes(routesToUpdate, mode);
    setSortedRoutes(sorted);
    return sorted;
  }

  function addRouteHistoryItem(src, dest, vehicle) {
    const item = buildHistoryItem(src, dest, vehicle);
    const next = [item, ...routeHistory.filter((e) => e.id !== item.id)].slice(0, 5);
    setRouteHistory(next);
    saveRouteHistory(next);
  }

  /* ─── Map init ─── */
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [78.9629, 20.5937],
      zoom: 4,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    return () => mapRef.current.remove();
  }, []);

  /* ─── Resize map when sidebar toggles ─── */
  const handleSidebarTransitionEnd = () => {
    if (mapRef.current) mapRef.current.resize();
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    drawRoute(route.coordinates);
    showTollMarkers(route);
  };

  useEffect(() => {
    if (routes.length > 0) updateSortedRoutes(routes, filterMode);
  }, [filterMode, routes]);

  useEffect(() => {
    if (sortedRoutes.length > 0) {
      setSelectedRoute(sortedRoutes[0]);
      drawRoute(sortedRoutes[0].coordinates);
      showTollMarkers(sortedRoutes[0]);
    }
  }, [sortedRoutes, showTollMarkers]);

  /* ─── Route calculation ─── */
  const handleCalculateRoute = async () => {
    if (!source || !destination) {
      setError("Please enter both source and destination");
      return;
    }

    setLoading(true);
    setError(null);
    setRoutes([]);
    setSelectedRoute(null);

    try {
      const sourceCoords = await geocodeLocation(source);
      const destCoords = await geocodeLocation(destination);

      // Geocode waypoints
      const waypointCoords = [];
      for (const wp of waypoints) {
        if (wp.text.trim()) {
          const coords = await geocodeLocation(wp.text);
          waypointCoords.push(coords);
        }
      }

      const response = await fetch(`${API_BASE_URL}/route/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: sourceCoords,
          destination: destCoords,
          waypoints: waypointCoords,
          vehicleType,
          avoidTolls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `API Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const routesData = data.routes || [];
      if (routesData.length === 0)
        throw new Error("No routes found for these locations");

      const sorted = updateSortedRoutes(routesData, filterMode);
      setRoutes(routesData);
      setSortedRoutes(sorted);
      setSelectedRoute(sorted[0]);
      addRouteHistoryItem(source, destination, vehicleType);

      if (sorted[0].coordinates) {
        drawRoute(sorted[0].coordinates);
        showTollMarkers(sorted[0]);
      }

      const start = [sourceCoords.lng, sourceCoords.lat];
      const end = [destCoords.lng, destCoords.lat];

      // Origin marker
      const originGeo = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: { type: "Point", coordinates: start },
          },
        ],
      };
      if (mapRef.current.getSource("origin-circle")) {
        mapRef.current.getSource("origin-circle").setData(originGeo);
      } else {
        mapRef.current.addSource("origin-circle", {
          type: "geojson",
          data: originGeo,
        });
        mapRef.current.addLayer({
          id: "origin-circle",
          type: "circle",
          source: "origin-circle",
          paint: { "circle-radius": 10, "circle-color": "#22c55e" },
        });
      }

      // Destination marker
      const destGeo = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: { type: "Point", coordinates: end },
          },
        ],
      };
      if (mapRef.current.getSource("destination-circle")) {
        mapRef.current.getSource("destination-circle").setData(destGeo);
      } else {
        mapRef.current.addSource("destination-circle", {
          type: "geojson",
          data: destGeo,
        });
        mapRef.current.addLayer({
          id: "destination-circle",
          type: "circle",
          source: "destination-circle",
          paint: { "circle-radius": 10, "circle-color": "#ef4444" },
        });
      }

      const bounds = new mapboxgl.LngLatBounds().extend(start).extend(end);
      mapRef.current.fitBounds(bounds, { padding: 80 });
    } catch (err) {
      console.error("Route calculation error:", err);
      setError(err.message || "Failed to calculate route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const VehicleIcon = VEHICLE_ICONS[vehicleType] || Car;

  /* ═══════════════════════════════════ */
  /*              RENDER                 */
  /* ═══════════════════════════════════ */
  return (
    <div className="h-screen flex bg-slate-950 text-slate-100 overflow-hidden">
      {/* ─── SIDEBAR ─── */}
      <div
        ref={sidebarRef}
        onTransitionEnd={handleSidebarTransitionEnd}
        className={`sidebar-transition flex-shrink-0 ${
          sidebarOpen ? "w-80" : "w-0"
        } h-full overflow-hidden bg-slate-900 border-r border-slate-800`}
      >
        <div className="w-80 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight">Route & Toll</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Calculator
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Content — scrollable */}
          <div className="flex-1 overflow-y-auto sidebar-scroll px-4 py-4 space-y-5">
            {/* ── Route Inputs ── */}
            <div>
              <h2 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Route Details
              </h2>

              <div className="space-y-3">
                {/* Source */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <label className="text-xs font-medium text-slate-400">
                      From
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter starting point"
                    value={source}
                    onChange={(e) =>
                      handleLocationChange("source", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-200 placeholder-slate-500 outline-none transition-all"
                  />
                  {sourceSuggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-auto">
                      {sourceSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSuggestionSelect("source", s)}
                          className="suggestion-item w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSource(destination);
                      setDestination(source);
                      setSourceSuggestions([]);
                      setDestinationSuggestions([]);
                    }}
                    className="p-1.5 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-indigo-500/50 transition-all group"
                    title="Swap source and destination"
                  >
                    <ArrowUpDown className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </button>
                </div>

                {/* Destination */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <label className="text-xs font-medium text-slate-400">
                      To
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter destination"
                    value={destination}
                    onChange={(e) =>
                      handleLocationChange("destination", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-200 placeholder-slate-500 outline-none transition-all"
                  />
                  {destinationSuggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-auto">
                      {destinationSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            handleSuggestionSelect("destination", s)
                          }
                          className="suggestion-item w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Waypoints ── */}
            <div>
              {waypoints.map((wp, idx) => (
                <div key={idx} className="relative mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <GripVertical className="w-3 h-3 text-slate-600" />
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <label className="text-xs font-medium text-slate-400">
                      Stop {idx + 1}
                    </label>
                    <button
                      type="button"
                      onClick={() => removeWaypoint(idx)}
                      className="ml-auto p-0.5 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove stop"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder={`Enter stop ${idx + 1}`}
                    value={wp.text}
                    onChange={(e) => handleWaypointChange(idx, e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-200 placeholder-slate-500 outline-none transition-all"
                  />
                  {wp.suggestions && wp.suggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-auto">
                      {wp.suggestions.map((s, si) => (
                        <button
                          key={si}
                          type="button"
                          onClick={() => handleWaypointSuggestionSelect(idx, s)}
                          className="suggestion-item w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addWaypoint}
                disabled={waypoints.length >= 10}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              >
                <Plus className="w-3 h-3" /> Add stop
              </button>
            </div>

            {/* ── Avoid Tolls Toggle ── */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <span className="relative inline-block w-9 h-5">
                <input
                  type="checkbox"
                  checked={avoidTolls}
                  onChange={(e) => setAvoidTolls(e.target.checked)}
                  className="sr-only peer"
                />
                <span className="block w-full h-full rounded-full bg-slate-700 peer-checked:bg-indigo-500 transition-colors" />
                <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                <ShieldOff className="w-3.5 h-3.5" /> Avoid tolls
              </span>
            </label>

            {/* ── Options Row ── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Vehicle
                </label>
                <div className="relative">
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 outline-none appearance-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  >
                    <option value="car">Car</option>
                    <option value="truck">Truck</option>
                    <option value="bus">Bus</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                  <VehicleIcon className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Filter
                </label>
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 outline-none appearance-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                >
                  <option value="fastest">Fastest</option>
                  <option value="shortest">Shortest</option>
                  <option value="lowestToll">Lowest Toll</option>
                </select>
              </div>
            </div>

            {/* ── Calculate Button ── */}
            <button
              onClick={handleCalculateRoute}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Route className="w-4 h-4" />
                  Calculate Route
                </>
              )}
            </button>

            {/* ── Loading Progress Bar ── */}
            {loading && (
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full progress-bar rounded-full" />
              </div>
            )}

            {/* ── Error ── */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2.5 rounded-lg flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{error}</span>
              </div>
            )}

            {/* ── Loading Skeletons ── */}
            {loading && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/50">
                  <SkeletonBar />
                  <SkeletonBar />
                  <SkeletonBar />
                </div>
              </div>
            )}

            {/* ── Metric Cards ── */}
            {selectedRoute && !loading && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                <MetricCard
                  icon={Navigation}
                  label="Distance"
                  value={selectedRoute.distance.toFixed(1)}
                  unit="km"
                  color="blue"
                  delay={0}
                />
                <MetricCard
                  icon={Clock}
                  label="Duration"
                  value={Math.floor(selectedRoute.duration / 3600) > 0 ? `${Math.floor(selectedRoute.duration / 3600)}h ${Math.floor((selectedRoute.duration % 3600) / 60)}m` : `${Math.floor(selectedRoute.duration / 60)}`}
                  unit={Math.floor(selectedRoute.duration / 3600) > 0 ? "" : "min"}
                  color="green"
                  delay={100}
                />
                <MetricCard
                  icon={DollarSign}
                  label="Total Toll"
                  value={`₹${selectedRoute.totalTollCost.toFixed(0)}`}
                  unit=""
                  color="amber"
                  delay={200}
                />
                <MetricCard
                  icon={Fuel}
                  label="Fuel Cost"
                  value={`₹${(selectedRoute.fuelCost || 0).toFixed(0)}`}
                  unit={`${(selectedRoute.fuelLitres || 0).toFixed(1)}L`}
                  color="purple"
                  delay={300}
                />
              </div>
            )}

            {/* ── Traffic ETA + Total Trip Cost ── */}
            {selectedRoute && !loading && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                {selectedRoute.durationTraffic != null && (
                  <MetricCard
                    icon={Activity}
                    label="With Traffic"
                    value={Math.floor(selectedRoute.durationTraffic / 3600) > 0 ? `${Math.floor(selectedRoute.durationTraffic / 3600)}h ${Math.floor((selectedRoute.durationTraffic % 3600) / 60)}m` : `${Math.floor(selectedRoute.durationTraffic / 60)}`}
                    unit={Math.floor(selectedRoute.durationTraffic / 3600) > 0 ? "" : "min"}
                    color="amber"
                    delay={400}
                  />
                )}
                <MetricCard
                  icon={DollarSign}
                  label="Total Trip Cost"
                  value={`₹${(selectedRoute.totalTripCost || 0).toFixed(0)}`}
                  unit="toll + fuel"
                  color="blue"
                  delay={500}
                />
              </div>
            )}

            {/* ── Route Comparison Table ── */}
            {sortedRoutes.length > 0 && !loading && (
              <div className="animate-slide-up">
                <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" /> Route Comparison
                </h3>
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3">
                  <RouteComparisonTable
                    routes={sortedRoutes}
                    selectedId={selectedRoute?.id}
                    onSelect={handleRouteSelect}
                  />
                </div>
              </div>
            )}

            {/* ── Toll Breakdown (Bar Chart) ── */}
            {selectedRoute?.tolls?.length > 0 && !loading && (
              <div className="animate-slide-up">
                <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> Toll Breakdown
                </h3>
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <TollBarChart tolls={selectedRoute.tolls} />
                </div>
              </div>
            )}

            {/* ── Recent Searches ── */}
            {routeHistory.length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <History className="w-3 h-3" /> Recent
                </h3>
                <div className="space-y-1.5">
                  {routeHistory.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSource(item.source);
                        setDestination(item.destination);
                        setVehicleType(item.vehicleType);
                        setFilterMode("fastest");
                        setSourceSuggestions([]);
                        setDestinationSuggestions([]);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors border border-transparent hover:border-slate-700/50"
                    >
                      <div className="font-medium text-slate-300 truncate">
                        {item.source} → {item.destination}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {item.vehicleType}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MAIN AREA (Map) ─── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="absolute top-4 left-4 z-20 w-8 h-8 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
