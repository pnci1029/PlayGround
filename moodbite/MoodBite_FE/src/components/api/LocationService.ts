import { LocationDTO } from "../../types/test";

export class LocationService {
  
  /**
   * 사용자의 현재 위치를 가져옵니다.
   * @returns Promise<LocationDTO | null> 위치 정보 또는 null (권한 거부/에러 시)
   */
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
          console.log("위치 정보를 성공적으로 가져왔습니다:", location);
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

  /**
   * 위치 권한이 허용되어 있는지 확인합니다.
   * @returns Promise<boolean> 권한 상태
   */
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

  /**
   * 위치 권한 요청을 위한 사용자 안내 메시지
   */
  static getLocationPermissionMessage(): string {
    return "더 정확한 맛집 추천을 위해 위치 정보 권한을 허용해 주세요. 브라우저 설정에서 위치 권한을 활성화할 수 있습니다.";
  }

  /**
   * 거리 계산 (두 좌표 간의 직선거리)
   * @param lat1 위도 1
   * @param lng1 경도 1
   * @param lat2 위도 2
   * @param lng2 경도 2
   * @returns 미터 단위 거리
   */
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