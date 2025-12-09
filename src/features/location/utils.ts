export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km

  if (d < 1) {
    return `${Math.round(d * 1000)} m`;
  }
  return `${d.toFixed(1)} km`;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const parseEWKB = (hex: string): { latitude: number; longitude: number } | null => {
  try {
    // Basic validation for EWKB Point with SRID (01 01000020 ...)
    // Length should be 1 byte (endian) + 4 (type) + 4 (srid) + 16 (coords) = 25 bytes = 50 hex chars
    // Actually coords are 8 bytes each = 16 bytes.
    // Total: 1 + 4 + 4 + 8 + 8 = 25 bytes = 50 hex chars.
    // Wait, double is 8 bytes. 2 doubles = 16 bytes.
    
    if (!hex || hex.length < 50) return null;

    // We assume Little Endian (01) and SRID 4326 for simplicity as that's what we insert
    // Skip header (9 bytes: 1 endian + 4 type + 4 srid) -> 18 hex chars
    const coordsHex = hex.substring(18);
    
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    
    // Parse X (Longitude)
    // Hex string to bytes
    for (let i = 0; i < 8; i++) {
        const byteVal = parseInt(coordsHex.substring(i * 2, i * 2 + 2), 16);
        view.setUint8(i, byteVal);
    }
    const longitude = view.getFloat64(0, true); // true for little endian

    // Parse Y (Latitude)
    for (let i = 0; i < 8; i++) {
        const byteVal = parseInt(coordsHex.substring(16 + i * 2, 16 + i * 2 + 2), 16);
        view.setUint8(i, byteVal);
    }
    const latitude = view.getFloat64(0, true);

    return { latitude, longitude };
  } catch (e) {
    console.warn("Failed to parse EWKB:", e);
    return null;
  }
};
