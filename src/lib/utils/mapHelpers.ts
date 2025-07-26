export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const calculatePolygonArea = (coordinates: LatLng[]): number => {
  if (coordinates.length < 3) return 0;
  
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i].lat * coordinates[j].lng;
    area -= coordinates[j].lat * coordinates[i].lng;
  }
  
  return Math.abs(area) / 2;
};

export const getPolygonCenter = (coordinates: LatLng[]): LatLng => {
  if (coordinates.length === 0) return { lat: 0, lng: 0 };
  
  let lat = 0;
  let lng = 0;
  
  coordinates.forEach(coord => {
    lat += coord.lat;
    lng += coord.lng;
  });
  
  return {
    lat: lat / coordinates.length,
    lng: lng / coordinates.length
  };
};

export const generateMapThumbnail = (
  center: LatLng, 
  zoom: number = 15, 
  size: string = '300x200'
): string => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=${size}&key=${apiKey}`;
};

export const calculateDistance = (point1: LatLng, point2: LatLng): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};