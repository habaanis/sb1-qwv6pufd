import { logger } from '../logging/distributedLogger';

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface GeolocationResult {
  coordinates: GeolocationCoordinates;
  timestamp: number;
  city?: string;
  governorate?: string;
}

interface NearbyResult {
  id: string;
  name: string;
  type: string;
  distance: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

class GeolocationManager {
  private currentPosition: GeolocationResult | null = null;
  private watchId: number | null = null;

  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  async getCurrentPosition(): Promise<GeolocationResult> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        const error = 'Geolocation not supported';
        logger.error(error);
        reject(new Error(error));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const result: GeolocationResult = {
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            },
            timestamp: position.timestamp
          };

          const location = await this.reverseGeocode(
            result.coordinates.latitude,
            result.coordinates.longitude
          );

          if (location) {
            result.city = location.city;
            result.governorate = location.governorate;
          }

          this.currentPosition = result;

          logger.info('Geolocation acquired', {
            lat: result.coordinates.latitude,
            lon: result.coordinates.longitude,
            city: result.city
          });

          resolve(result);
        },
        (error) => {
          logger.error('Geolocation error', new Error(error.message));
          reject(new Error(error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  watchPosition(callback: (result: GeolocationResult) => void): void {
    if (!this.isSupported()) {
      logger.error('Geolocation not supported');
      return;
    }

    if (this.watchId !== null) {
      logger.warn('Already watching position');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const result: GeolocationResult = {
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          },
          timestamp: position.timestamp
        };

        const location = await this.reverseGeocode(
          result.coordinates.latitude,
          result.coordinates.longitude
        );

        if (location) {
          result.city = location.city;
          result.governorate = location.governorate;
        }

        this.currentPosition = result;

        callback(result);
      },
      (error) => {
        logger.error('Geolocation watch error', new Error(error.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    logger.info('Started watching position');
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      logger.info('Stopped watching position');
    }
  }

  private async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{ city: string; governorate: string } | null> {
    try {
      const tunisianCities = [
        { name: 'Tunis', lat: 36.8065, lon: 10.1815, gov: 'Tunis' },
        { name: 'Sfax', lat: 34.7406, lon: 10.7603, gov: 'Sfax' },
        { name: 'Sousse', lat: 35.8256, lon: 10.6369, gov: 'Sousse' },
        { name: 'Kairouan', lat: 35.6781, lon: 10.0963, gov: 'Kairouan' },
        { name: 'Bizerte', lat: 37.2744, lon: 9.8739, gov: 'Bizerte' },
        { name: 'Gabès', lat: 33.8815, lon: 10.0982, gov: 'Gabès' },
        { name: 'Ariana', lat: 36.8625, lon: 10.1956, gov: 'Ariana' },
        { name: 'Gafsa', lat: 34.4250, lon: 8.7842, gov: 'Gafsa' },
        { name: 'Monastir', lat: 35.7774, lon: 10.8262, gov: 'Monastir' },
        { name: 'Ben Arous', lat: 36.7538, lon: 10.2194, gov: 'Ben Arous' },
        { name: 'Kasserine', lat: 35.1673, lon: 8.8303, gov: 'Kasserine' },
        { name: 'Médenine', lat: 33.3547, lon: 10.5053, gov: 'Médenine' },
        { name: 'Nabeul', lat: 36.4561, lon: 10.7356, gov: 'Nabeul' },
        { name: 'Tataouine', lat: 32.9296, lon: 10.4517, gov: 'Tataouine' },
        { name: 'Béja', lat: 36.7256, lon: 9.1817, gov: 'Béja' },
        { name: 'Jendouba', lat: 36.5011, lon: 8.7803, gov: 'Jendouba' },
        { name: 'Mahdia', lat: 35.5047, lon: 11.0622, gov: 'Mahdia' },
        { name: 'Sidi Bouzid', lat: 35.0381, lon: 9.4858, gov: 'Sidi Bouzid' },
        { name: 'Zaghouan', lat: 36.4028, lon: 10.1428, gov: 'Zaghouan' },
        { name: 'Siliana', lat: 36.0853, lon: 9.3706, gov: 'Siliana' },
        { name: 'Kef', lat: 36.1742, lon: 8.7050, gov: 'Kef' },
        { name: 'Tozeur', lat: 33.9197, lon: 8.1339, gov: 'Tozeur' },
        { name: 'Kebili', lat: 33.7047, lon: 8.9694, gov: 'Kebili' },
        { name: 'Manouba', lat: 36.8083, lon: 10.0975, gov: 'Manouba' }
      ];

      let closestCity = tunisianCities[0];
      let minDistance = this.calculateDistance(
        latitude,
        longitude,
        closestCity.lat,
        closestCity.lon
      );

      for (const city of tunisianCities) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          city.lat,
          city.lon
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      }

      return {
        city: closestCity.name,
        governorate: closestCity.gov
      };
    } catch (error) {
      logger.error('Reverse geocoding failed', error as Error);
      return null;
    }
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  async findNearby(
    maxDistance: number = 10,
    type?: string
  ): Promise<NearbyResult[]> {
    if (!this.currentPosition) {
      try {
        await this.getCurrentPosition();
      } catch (error) {
        logger.error('Cannot find nearby without position', error as Error);
        return [];
      }
    }

    if (!this.currentPosition) return [];

    const { latitude, longitude } = this.currentPosition.coordinates;

    const mockResults: NearbyResult[] = [
      {
        id: '1',
        name: 'Restaurant Le Gourmet',
        type: 'business',
        distance: 2.5,
        coordinates: { latitude: latitude + 0.02, longitude: longitude + 0.01 }
      },
      {
        id: '2',
        name: 'Hôtel Tunisia Palace',
        type: 'business',
        distance: 3.8,
        coordinates: { latitude: latitude - 0.03, longitude: longitude + 0.02 }
      },
      {
        id: '3',
        name: 'Salon Tech 2025',
        type: 'event',
        distance: 5.2,
        coordinates: { latitude: latitude + 0.04, longitude: longitude - 0.01 }
      }
    ];

    return mockResults.filter(result => result.distance <= maxDistance);
  }

  getCachedPosition(): GeolocationResult | null {
    return this.currentPosition;
  }
}

export const geolocationManager = new GeolocationManager();

export async function getCurrentLocation(): Promise<GeolocationResult> {
  return geolocationManager.getCurrentPosition();
}

export function watchLocation(callback: (result: GeolocationResult) => void): void {
  geolocationManager.watchPosition(callback);
}

export function stopWatchingLocation(): void {
  geolocationManager.stopWatching();
}

export async function findNearby(
  maxDistance?: number,
  type?: string
): Promise<NearbyResult[]> {
  return geolocationManager.findNearby(maxDistance, type);
}

export function isGeolocationSupported(): boolean {
  return geolocationManager.isSupported();
}

if (typeof window !== 'undefined') {
  (window as any).geolocation = geolocationManager;
}
