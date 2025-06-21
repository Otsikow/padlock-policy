
interface GeolocationResponse {
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  timezone: string;
  currency: string;
  status: string;
}

export const detectUserCountry = async (): Promise<string> => {
  try {
    // Try multiple geolocation services for reliability
    const services = [
      'http://ip-api.com/json/?fields=countryCode',
      'https://ipapi.co/json/',
      'https://ipinfo.io/json'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        
        // Handle different response formats
        const countryCode = data.countryCode || data.country_code || data.country;
        if (countryCode && countryCode.length === 2) {
          console.log(`Detected country: ${countryCode} from ${service}`);
          return countryCode.toUpperCase();
        }
      } catch (error) {
        console.warn(`Failed to get location from ${service}:`, error);
        continue;
      }
    }
    
    // Fallback to browser locale
    const locale = navigator.language || 'en-GB';
    const countryFromLocale = locale.split('-')[1] || 'GB';
    console.log(`Using locale fallback: ${countryFromLocale}`);
    return countryFromLocale.toUpperCase();
    
  } catch (error) {
    console.error('All geolocation attempts failed:', error);
    return 'GB'; // Default fallback
  }
};

export const getTimezoneCountry = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Simple timezone to country mapping for common cases
    const timezoneMap: { [key: string]: string } = {
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Toronto': 'CA',
      'Europe/London': 'GB',
      'Europe/Berlin': 'DE',
      'Europe/Paris': 'FR',
      'Africa/Accra': 'GH',
      'Africa/Lagos': 'NG',
      'Asia/Kolkata': 'IN',
      'Australia/Sydney': 'AU',
      'Africa/Nairobi': 'KE',
    };
    
    return timezoneMap[timezone] || 'GB';
  } catch (error) {
    console.error('Failed to detect timezone country:', error);
    return 'GB';
  }
};
