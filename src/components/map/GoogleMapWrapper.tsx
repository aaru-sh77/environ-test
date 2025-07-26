'use client';

import { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Square, Circle, Edit3, Trash2 } from 'lucide-react';

const libraries: ("drawing" | "geometry" | "places")[] = ['drawing', 'geometry', 'places'];

interface MapProps {
  onGeometryChange?: (geometry: any) => void;
  initialGeometry?: any;
  center?: { lat: number; lng: number };
}

export function GoogleMapWrapper({ onGeometryChange, initialGeometry, center }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [currentShape, setCurrentShape] = useState<google.maps.Polygon | google.maps.Rectangle | google.maps.Circle | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingMode, setDrawingMode] = useState<google.maps.drawing.OverlayType | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  const defaultCenter = center || { lat: 40.7128, lng: -74.0060 }; // New York City

  const mapOptions: google.maps.MapOptions = {
    zoom: 15,
    center: defaultCenter,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
  };

  useEffect(() => {
    if (isLoaded && map && !drawingManager) {
      const manager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#22c55e',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#16a34a',
          editable: true,
          draggable: true,
        },
        rectangleOptions: {
          fillColor: '#3b82f6',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#1d4ed8',
          editable: true,
          draggable: true,
        },
        circleOptions: {
          fillColor: '#f59e0b',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#d97706',
          editable: true,
          draggable: true,
        },
      });

      manager.setMap(map);
      setDrawingManager(manager);

      // Handle drawing completion
      google.maps.event.addListener(manager, 'overlaycomplete', (event: any) => {
        clearCurrentShape();
        setCurrentShape(event.overlay);
        setIsDrawingMode(false);
        setDrawingMode(null);
        manager.setDrawingMode(null);

        // Convert to geometry data
        const geometry = shapeToGeometry(event.overlay, event.type);
        onGeometryChange?.(geometry);

        // Add event listeners for shape modifications
        if (event.overlay.getPath) {
          google.maps.event.addListener(event.overlay.getPath(), 'set_at', () => {
            const updatedGeometry = shapeToGeometry(event.overlay, event.type);
            onGeometryChange?.(updatedGeometry);
          });
          google.maps.event.addListener(event.overlay.getPath(), 'insert_at', () => {
            const updatedGeometry = shapeToGeometry(event.overlay, event.type);
            onGeometryChange?.(updatedGeometry);
          });
        }
      });
    }
  }, [isLoaded, map, drawingManager, onGeometryChange]);

  const shapeToGeometry = (shape: any, type: google.maps.drawing.OverlayType) => {
    let coordinates: number[][] = [];
    let geometryType = '';

    switch (type) {
      case google.maps.drawing.OverlayType.POLYGON:
        geometryType = 'polygon';
        const path = shape.getPath().getArray();
        coordinates = path.map((latLng: google.maps.LatLng) => [latLng.lng(), latLng.lat()]);
        break;
      case google.maps.drawing.OverlayType.RECTANGLE:
        geometryType = 'rectangle';
        const bounds = shape.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        coordinates = [
          [sw.lng(), sw.lat()],
          [ne.lng(), sw.lat()],
          [ne.lng(), ne.lat()],
          [sw.lng(), ne.lat()],
          [sw.lng(), sw.lat()]
        ];
        break;
      case google.maps.drawing.OverlayType.CIRCLE:
        geometryType = 'circle';
        const center = shape.getCenter();
        const radius = shape.getRadius();
        coordinates = [[center.lng(), center.lat(), radius]];
        break;
    }

    return {
      type: geometryType,
      coordinates,
      bounds: shape.getBounds?.()
    };
  };

  const clearCurrentShape = () => {
    if (currentShape) {
      currentShape.setMap(null);
      setCurrentShape(null);
    }
  };

  const startDrawing = (mode: google.maps.drawing.OverlayType) => {
    if (drawingManager) {
      setIsDrawingMode(true);
      setDrawingMode(mode);
      drawingManager.setDrawingMode(mode);
    }
  };

  const stopDrawing = () => {
    if (drawingManager) {
      setIsDrawingMode(false);
      setDrawingMode(null);
      drawingManager.setDrawingMode(null);
    }
  };

  const deleteShape = () => {
    clearCurrentShape();
    onGeometryChange?.(null);
  };

  if (!isLoaded) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drawing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Drawing Tools</span>
            {isDrawingMode && (
              <Badge variant="secondary">
                Drawing {drawingMode?.replace('_', ' ')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={drawingMode === google.maps.drawing.OverlayType.POLYGON ? "default" : "outline"}
              size="sm"
              onClick={() => startDrawing(google.maps.drawing.OverlayType.POLYGON)}
              disabled={isDrawingMode && drawingMode !== google.maps.drawing.OverlayType.POLYGON}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Polygon
            </Button>
            
            <Button
              variant={drawingMode === google.maps.drawing.OverlayType.RECTANGLE ? "default" : "outline"}
              size="sm"
              onClick={() => startDrawing(google.maps.drawing.OverlayType.RECTANGLE)}
              disabled={isDrawingMode && drawingMode !== google.maps.drawing.OverlayType.RECTANGLE}
            >
              <Square className="h-4 w-4 mr-2" />
              Rectangle
            </Button>
            
            <Button
              variant={drawingMode === google.maps.drawing.OverlayType.CIRCLE ? "default" : "outline"}
              size="sm"
              onClick={() => startDrawing(google.maps.drawing.OverlayType.CIRCLE)}
              disabled={isDrawingMode && drawingMode !== google.maps.drawing.OverlayType.CIRCLE}
            >
              <Circle className="h-4 w-4 mr-2" />
              Circle
            </Button>

            {isDrawingMode && (
              <Button variant="secondary" size="sm" onClick={stopDrawing}>
                Cancel
              </Button>
            )}

            {currentShape && (
              <Button variant="destructive" size="sm" onClick={deleteShape}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Shape
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={mapOptions}
          onLoad={(map) => {
            mapRef.current = map;
            setMap(map);
          }}
          onUnmount={() => {
            mapRef.current = null;
            setMap(null);
          }}
        />
      </div>
    </div>
  );
}