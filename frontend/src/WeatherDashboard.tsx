import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Thermometer, Droplets, Sun, Cloud, Calendar } from 'lucide-react';

interface WeatherData {
  date: string;
  dateLabel: string;
  telop: string;
  description: string;
  temperature: {
    max: string;
    min: string;
  };
  chanceOfRain: {
    T00_06: string;
    T06_12: string;
    T12_18: string;
    T18_24: string;
  };
  image?: {
    url: string;
    title: string;
  };
}

const WeatherCard: React.FC<{ weather: WeatherData; title: string }> = ({ weather, title }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h2 className="text-2xl font-bold mb-4 flex items-center">
      <Calendar className="mr-2" />{title}
    </h2>
    <div className="flex items-center mb-4">
      {weather.image && weather.image.url ? (
        <img src={weather.image.url} alt={weather.image.title || '天気アイコン'} className="w-16 h-16 mr-4" />
      ) : (
        <Cloud className="w-16 h-16 mr-4 text-gray-400" /> // デフォルトのアイコン
      )}
      <div>
        <p className="text-xl font-semibold">{weather.telop || '情報なし'}</p>
        <p>{weather.date} ({weather.dateLabel})</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="flex items-center">
        <Thermometer className="w-6 h-6 text-red-500 mr-2" />
        <div>
          <p className="font-semibold">最高気温</p>
          <p>{weather.temperature?.max || 'N/A'}°C</p>
        </div>
      </div>
      <div className="flex items-center">
        <Thermometer className="w-6 h-6 text-blue-500 mr-2" />
        <div>
          <p className="font-semibold">最低気温</p>
          <p>{weather.temperature?.min || 'N/A'}°C</p>
        </div>
      </div>
    </div>
    <div>
      <h3 className="font-semibold mb-2">降水確率</h3>
      <div className="grid grid-cols-4 gap-2 text-sm">
        <div>
          <p>0時-6時</p>
          <p>{weather.chanceOfRain?.T00_06 || 'N/A'}</p>
        </div>
        <div>
          <p>6時-12時</p>
          <p>{weather.chanceOfRain?.T06_12 || 'N/A'}</p>
        </div>
        <div>
          <p>12時-18時</p>
          <p>{weather.chanceOfRain?.T12_18 || 'N/A'}</p>
        </div>
        <div>
          <p>18時-24時</p>
          <p>{weather.chanceOfRain?.T18_24 || 'N/A'}</p>
        </div>
      </div>
    </div>
  </div>
);

const WeatherDashboard: React.FC = () => {
  const [todayWeather, setTodayWeather] = useState<WeatherData | null>(null);
  const [tomorrowWeather, setTomorrowWeather] = useState<WeatherData | null>(null);
  const [lastMotion, setLastMotion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get('http://localhost:3001/weather');
        if (response.data.weather) {
          setTodayWeather(response.data.weather);
        }
        if (response.data.tomorrow) {
          setTomorrowWeather(response.data.tomorrow);
        }
        setLastMotion(response.data.lastMotionDetected);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
        setError('気象データの取得に失敗しました。');
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="text-2xl text-red-500">{error}</div>;
  }

  if (!todayWeather || !tomorrowWeather) {
    return <div className="text-2xl">気象データを読み込んでいます...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">東京の天気予報</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeatherCard weather={todayWeather} title="今日の天気" />
        <WeatherCard weather={tomorrowWeather} title="明日の天気" />
      </div>
      <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">天気の詳細</h2>
        <p>{todayWeather.description || '詳細情報がありません。'}</p>
      </div>
      {lastMotion && (
        <p className="mt-4 text-sm text-gray-600 text-center">
          最後の動き検知: {new Date(lastMotion).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default WeatherDashboard;
