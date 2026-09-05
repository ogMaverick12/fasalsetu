export interface WeatherSnapshot {
  temperature_c: number;
  humidity_percent: number;
  precipitation_mm: number;
  rain_probability_max: number;
  wind_speed_kmh: number;
  weather_description: string;
  is_rain_likely: boolean;
  is_high_humidity: boolean;
}

const WMO_WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snowfall',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
};

/**
 * Fetch current and forecast weather conditions from Open-Meteo (free, keyless API)
 */
export async function fetchHyperlocalWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKolkata`;

  const response = await fetch(url, {
    next: { revalidate: 1800 }, // cache for 30 minutes
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo weather fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  const current = data.current || {};
  const daily = data.daily || {};

  const temp = current.temperature_2m ?? 28;
  const humidity = current.relative_humidity_2m ?? 65;
  const precip = current.precipitation ?? 0;
  const rainProb = daily.precipitation_probability_max?.[0] ?? (precip > 0 ? 80 : 20);
  const windSpeed = current.wind_speed_10m ?? 12;
  const weatherCode = current.weather_code ?? 1;

  const description = WMO_WEATHER_CODES[weatherCode] || 'Partly cloudy';
  const isRainLikely = rainProb >= 50 || precip > 0.5;
  const isHighHumidity = humidity >= 70;

  return {
    temperature_c: Math.round(temp * 10) / 10,
    humidity_percent: Math.round(humidity),
    precipitation_mm: Math.round(precip * 10) / 10,
    rain_probability_max: Math.round(rainProb),
    wind_speed_kmh: Math.round(windSpeed * 10) / 10,
    weather_description: description,
    is_rain_likely: isRainLikely,
    is_high_humidity: isHighHumidity,
  };
}
