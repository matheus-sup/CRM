"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Trash2, Loader2, Search, MapPin, Pencil, Square, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchLocation } from "@/lib/actions/delivery";

// Types
type PolygonZone = {
  coordinates: [number, number][];
};

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type DeliveryZoneMapProps = {
  initialCenter?: [number, number];
  initialZones?: Array<{
    id: string;
    name: string;
    type: string;
    coordinates?: string;
    centerLat?: number;
    centerLng?: number;
    radiusKm?: number;
    deliveryFee: number;
    isActive: boolean;
  }>;
  onZoneCreate?: (zone: { coordinates: [number, number][] }) => void;
  onZoneUpdate?: (zoneId: string, data: { coordinates: [number, number][] }) => void;
  editingZone?: PolygonZone | null;
  onEditingZoneChange?: (zone: PolygonZone | null) => void;
  isEditing?: boolean;
};

export function DeliveryZoneMap({
  initialCenter = [-23.5505, -46.6333], // São Paulo default
  initialZones = [],
  editingZone,
  onEditingZoneChange,
  isEditing = false,
}: DeliveryZoneMapProps) {
  const [mounted, setMounted] = useState(false);
  const [currentZone, setCurrentZone] = useState<PolygonZone | null>(editingZone || null);
  const [MapComponents, setMapComponents] = useState<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Dynamic import of react-leaflet components
    Promise.all([
      import("react-leaflet"),
      import("leaflet")
    ]).then(([mod, L]) => {
      // Create custom icon for draggable markers
      const createIcon = (color: string, isFirst: boolean = false) => {
        return L.divIcon({
          className: "custom-marker",
          html: `<div style="
            width: 14px;
            height: 14px;
            background: ${isFirst ? "#22c55e" : color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: grab;
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
      };

      setMapComponents({
        MapContainer: mod.MapContainer,
        TileLayer: mod.TileLayer,
        Polygon: mod.Polygon,
        Polyline: mod.Polyline,
        CircleMarker: mod.CircleMarker,
        Circle: mod.Circle,
        Marker: mod.Marker,
        useMapEvents: mod.useMapEvents,
        useMap: mod.useMap,
        Popup: mod.Popup,
        createIcon,
      });
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (editingZone) {
      setCurrentZone(editingZone);
    }
  }, [editingZone]);

  // Search for location using server action (avoids CORS issues)
  const handleSearchLocation = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchLocation(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearchLocation(value);
    }, 500);
  }, [handleSearchLocation]);

  // Select a search result - keeps results for re-selection
  const handleSelectResult = useCallback((result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (mapInstance) {
      mapInstance.setView([lat, lng], 14);
    }

    // Keep the search query and results so user can select again
    setShowResults(false);
  }, [mapInstance]);

  const handleMapClick = useCallback((latlng: [number, number]) => {
    if (!isEditing || !isDrawing) return;

    const newPoints = [...drawingPoints, latlng];
    setDrawingPoints(newPoints);
  }, [isEditing, isDrawing, drawingPoints]);

  const handleStartDrawing = useCallback(() => {
    setIsDrawing(true);
    setDrawingPoints([]);
    setCurrentZone(null);
    onEditingZoneChange?.(null);
  }, [onEditingZoneChange]);

  const handleFinishDrawing = useCallback(() => {
    if (drawingPoints.length >= 3) {
      const newZone = { coordinates: drawingPoints };
      setCurrentZone(newZone);
      onEditingZoneChange?.(newZone);
    }
    setIsDrawing(false);
    setDrawingPoints([]);
  }, [drawingPoints, onEditingZoneChange]);

  const handleUndoPoint = useCallback(() => {
    if (drawingPoints.length > 0) {
      setDrawingPoints(prev => prev.slice(0, -1));
    }
  }, [drawingPoints.length]);

  const handleClearZone = useCallback(() => {
    setCurrentZone(null);
    setDrawingPoints([]);
    setIsDrawing(false);
    onEditingZoneChange?.(null);
  }, [onEditingZoneChange]);

  // Handle dragging a drawing point
  const handleDrawingPointDrag = useCallback((index: number, newPos: [number, number]) => {
    setDrawingPoints(prev => {
      const updated = [...prev];
      updated[index] = newPos;
      return updated;
    });
  }, []);

  // Handle dragging a finished zone point
  const handleZonePointDrag = useCallback((index: number, newPos: [number, number]) => {
    if (!currentZone) return;
    const updated = [...currentZone.coordinates];
    updated[index] = newPos;
    const newZone = { coordinates: updated };
    setCurrentZone(newZone);
    onEditingZoneChange?.(newZone);
  }, [currentZone, onEditingZoneChange]);

  // Calculate area of polygon (approximate in km²)
  const calculateArea = useCallback((coords: [number, number][]) => {
    if (coords.length < 3) return 0;

    // Using Shoelace formula with Earth radius approximation
    const earthRadius = 6371; // km
    let area = 0;

    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      const lat1 = coords[i][0] * Math.PI / 180;
      const lat2 = coords[j][0] * Math.PI / 180;
      const lng1 = coords[i][1] * Math.PI / 180;
      const lng2 = coords[j][1] * Math.PI / 180;

      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs(area * earthRadius * earthRadius / 2);
    return area;
  }, []);

  if (!mounted || !MapComponents) {
    return (
      <div className="w-full h-[400px] bg-slate-100 rounded-lg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Circle, Marker, useMapEvents, useMap, Popup } = MapComponents;

  // Map controller component
  function MapController() {
    const map = useMap();

    useEffect(() => {
      setMapInstance(map);
    }, [map]);

    useMapEvents({
      click: (e: any) => {
        handleMapClick([e.latlng.lat, e.latlng.lng]);
      },
    });

    return null;
  }

  // Parse existing polygon coordinates from JSON string
  const parseCoordinates = (coordString: string | undefined): [number, number][] => {
    if (!coordString) return [];
    try {
      return JSON.parse(coordString);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Box */}
      {isEditing && (
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar cidade ou endereço..."
                className="pl-10"
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-start gap-3 border-b last:border-b-0"
                  onClick={() => handleSelectResult(result)}
                >
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700 line-clamp-2">
                    {result.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Pencil className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              {isDrawing
                ? `Clique no mapa para adicionar pontos (${drawingPoints.length} pontos)`
                : currentZone
                  ? "Área definida! Arraste os pontos para ajustar"
                  : "Clique em 'Desenhar' para começar a definir a área"}
            </p>
            <p className="text-xs text-blue-700">
              {isDrawing
                ? "Arraste os pontos para ajustar. Clique em 'Finalizar' quando terminar."
                : currentZone
                  ? "Ou clique em 'Desenhar' para redesenhar"
                  : "Desenhe um polígono clicando nos pontos do mapa"}
            </p>
          </div>
          <div className="flex gap-2">
            {isDrawing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUndoPoint}
                  disabled={drawingPoints.length === 0}
                >
                  <Undo className="w-4 h-4 mr-1" />
                  Desfazer
                </Button>
                <Button
                  size="sm"
                  onClick={handleFinishDrawing}
                  disabled={drawingPoints.length < 3}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Finalizar
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={handleStartDrawing}>
                  <Square className="w-4 h-4 mr-1" />
                  Desenhar
                </Button>
                {currentZone && (
                  <Button size="sm" variant="outline" onClick={handleClearZone}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="w-full h-[400px] rounded-lg overflow-hidden border relative z-0">
        <MapContainer
          center={currentZone?.coordinates?.[0] || initialCenter}
          zoom={13}
          style={{ height: "100%", width: "100%", cursor: isDrawing ? "crosshair" : "grab" }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController />

          {/* Existing zones */}
          {initialZones.map((zone) => {
            // Legacy circle support
            if (zone.type === "circle" && zone.centerLat && zone.centerLng && zone.radiusKm) {
              return (
                <Circle
                  key={zone.id}
                  center={[zone.centerLat, zone.centerLng]}
                  radius={zone.radiusKm * 1000}
                  pathOptions={{
                    color: zone.isActive ? "#3b82f6" : "#9ca3af",
                    fillColor: zone.isActive ? "#3b82f6" : "#9ca3af",
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="font-medium">{zone.name}</div>
                    <div className="text-sm text-slate-500">
                      Taxa: R$ {zone.deliveryFee.toFixed(2)}
                    </div>
                  </Popup>
                </Circle>
              );
            }

            // Polygon zones
            if (zone.type === "polygon" && zone.coordinates) {
              const coords = parseCoordinates(zone.coordinates);
              if (coords.length >= 3) {
                return (
                  <Polygon
                    key={zone.id}
                    positions={coords}
                    pathOptions={{
                      color: zone.isActive ? "#3b82f6" : "#9ca3af",
                      fillColor: zone.isActive ? "#3b82f6" : "#9ca3af",
                      fillOpacity: 0.2,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="font-medium">{zone.name}</div>
                      <div className="text-sm text-slate-500">
                        Taxa: R$ {zone.deliveryFee.toFixed(2)}
                      </div>
                    </Popup>
                  </Polygon>
                );
              }
            }

            return null;
          })}

          {/* Drawing preview - lines connecting points */}
          {isDrawing && drawingPoints.length > 0 && (
            <>
              {/* Line connecting points */}
              <Polyline
                positions={drawingPoints}
                pathOptions={{
                  color: "#ef4444",
                  weight: 2,
                  dashArray: "5, 5",
                }}
              />
              {/* Preview of closing line */}
              {drawingPoints.length >= 3 && (
                <Polyline
                  positions={[drawingPoints[drawingPoints.length - 1], drawingPoints[0]]}
                  pathOptions={{
                    color: "#ef4444",
                    weight: 2,
                    dashArray: "5, 5",
                    opacity: 0.5,
                  }}
                />
              )}
              {/* Draggable point markers */}
              {drawingPoints.map((point, index) => (
                <Marker
                  key={index}
                  position={point}
                  icon={MapComponents.createIcon("#ef4444", index === 0)}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e: any) => {
                      const { lat, lng } = e.target.getLatLng();
                      handleDrawingPointDrag(index, [lat, lng]);
                    },
                  }}
                />
              ))}
            </>
          )}

          {/* Current editing zone */}
          {currentZone && currentZone.coordinates.length >= 3 && (
            <>
              <Polygon
                positions={currentZone.coordinates}
                pathOptions={{
                  color: "#ef4444",
                  fillColor: "#ef4444",
                  fillOpacity: 0.3,
                  weight: 2,
                  dashArray: "5, 5",
                }}
              />
              {/* Draggable markers for finished zone */}
              {!isDrawing && currentZone.coordinates.map((point, index) => (
                <Marker
                  key={`zone-${index}`}
                  position={point}
                  icon={MapComponents.createIcon("#ef4444", index === 0)}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e: any) => {
                      const { lat, lng } = e.target.getLatLng();
                      handleZonePointDrag(index, [lat, lng]);
                    },
                  }}
                />
              ))}
            </>
          )}
        </MapContainer>
      </div>

      {currentZone && isEditing && currentZone.coordinates.length >= 3 && (
        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              <strong>Pontos:</strong> {currentZone.coordinates.length}
            </span>
            <span>
              <strong>Área aproximada:</strong> {calculateArea(currentZone.coordinates).toFixed(2)} km²
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
