export interface DetectedLocation {
  displayName: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

const DEFAULT_LOCATION: DetectedLocation = {
  displayName: 'Bangalore, Karnataka',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  latitude: 12.9716,
  longitude: 77.5946,
};

/** Reverse-geocodes a real GPS fix via BigDataCloud's free, keyless client
 * endpoint - an IP-lookup service (ipapi.co) has no way to accept
 * coordinates, so it would silently fall back to a network-based guess
 * instead of the actual fix. */
async function reverseGeocode(lat: number, lng: number): Promise<DetectedLocation> {
  const geo = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
  ).then((r) => r.json());
  const city = geo?.city || geo?.locality || 'Bangalore';
  const state = geo?.principalSubdivision || 'Karnataka';
  const country = geo?.countryName || 'India';
  return { displayName: `${city}, ${state}`, city, state, country, latitude: lat, longitude: lng };
}

async function ipLookup(): Promise<DetectedLocation> {
  const ipRes = await fetch('https://ipapi.co/json/').then((r) => r.json());
  const city = ipRes?.city || 'Bangalore';
  const state = ipRes?.region || 'Karnataka';
  const country = ipRes?.country_name || 'India';
  // ipapi.co's own free response already carries an approximate lat/lng for
  // the IP's resolved location (city-level accuracy, not a GPS fix) - using
  // it is what lets "Near You" still run a real geo-radius search when GPS
  // permission is denied, instead of only ever working for visitors who
  // grant it.
  const latitude = typeof ipRes?.latitude === 'number' ? ipRes.latitude : undefined;
  const longitude = typeof ipRes?.longitude === 'number' ? ipRes.longitude : undefined;
  return { displayName: `${city}, ${state}`, city, state, country, latitude, longitude };
}

/** Silent, best-effort location detection for the Home page's "Near You"
 * section: tries the device's real GPS first, falls back to an IP-based
 * city guess if GPS is denied/unavailable, and finally a hardcoded default
 * if both fail. Never throws - every branch always resolves to something
 * usable. */
export async function detectCurrentLocation(): Promise<DetectedLocation> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return ipLookup().catch(() => DEFAULT_LOCATION);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        reverseGeocode(position.coords.latitude, position.coords.longitude)
          .then(resolve)
          .catch(() => ipLookup().then(resolve).catch(() => resolve(DEFAULT_LOCATION)));
      },
      () => {
        // Permission denied or unavailable - fall back to IP-based guess.
        ipLookup().then(resolve).catch(() => resolve(DEFAULT_LOCATION));
      },
      { timeout: 6000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
