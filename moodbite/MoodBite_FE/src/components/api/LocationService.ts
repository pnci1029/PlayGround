import { LocationDTO } from "../../types/test";

export class LocationService {
  
  static async getCurrentLocation(): Promise<LocationDTO | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("이 브라우저는 위치 서비스를 지원하지 않습니다.");
        resolve(null);
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10초 타임아웃
        maximumAge: 300000, // 5분간 캐시된 위치 사용 가능
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationDTO = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          resolve(location);
        },
        (error) => {
          console.warn("위치 정보를 가져올 수 없습니다:", error.message);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.warn("사용자가 위치 정보 권한을 거부했습니다.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.warn("위치 정보를 사용할 수 없습니다.");
              break;
            case error.TIMEOUT:
              console.warn("위치 정보 요청이 시간 초과되었습니다.");
              break;
            default:
              console.warn("알 수 없는 오류가 발생했습니다.");
              break;
          }
          resolve(null);
        },
        options
      );
    });
  }

  static async checkLocationPermission(): Promise<boolean> {
    if (!navigator.permissions) {
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state === 'granted';
    } catch (error) {
      console.warn("위치 권한 확인 중 오류가 발생했습니다:", error);
      return false;
    }
  }

  static getLocationPermissionMessage(): string {
    return "위치 권한이 필요합니다.";
  }

  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }
}