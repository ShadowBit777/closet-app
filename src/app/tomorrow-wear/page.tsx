'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ClothingItem {
  id: number;
  name: string;
  category: string;
  image: string;
}

type Step = 'outer' | 'tops' | 'bottoms';

interface WeatherInfo {
  max: number;
  min: number;
  code: number;
}

export default function TomorrowWearPage() {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [laundryIds, setLaundryIds] = useState<number[]>([]);
  const [step, setStep] = useState<Step>('outer');

  const [selectedOuter, setSelectedOuter] = useState<number | null>(null);
  const [selectedTops, setSelectedTops] = useState<number[]>([]);
  const [selectedBottoms, setSelectedBottoms] = useState<number | null>(null);

  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [showLocationGuide, setShowLocationGuide] = useState(false);

  // 服一覧取得
  useEffect(() => {
    const saved = localStorage.getItem('clothes');
    if (saved) setClothes(JSON.parse(saved));
  }, []);

  // 洗濯リスト取得
  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem('laundryList') || '[]'
    );
    setLaundryIds(stored);
  }, []);

  // 位置情報ガイド（初回のみ）
  useEffect(() => {
    const guided = localStorage.getItem('locationGuideShown');
    if (!guided) {
      setShowLocationGuide(true);
      localStorage.setItem('locationGuideShown', 'true');
    }
  }, []);

  // 天気取得
  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia/Tokyo`
          );

          const data = await res.json();

          const tomorrowWeather: WeatherInfo = {
            max: data.daily.temperature_2m_max[1],
            min: data.daily.temperature_2m_min[1],
            code: data.daily.weathercode[1],
          };

          setWeather(tomorrowWeather);

          if (tomorrowWeather.max >= 20) {
            setStep('tops');
          }
        } catch {
          setWeatherError(true);
        }
      },
      () => setWeatherError(true)
    );
  }, []);

  const visibleClothes = clothes.filter((item) => {
    if (laundryIds.includes(item.id)) return false;
    if (step === 'outer') return item.category === 'アウター';
    if (step === 'tops') return item.category === 'トップス';
    if (step === 'bottoms') return item.category === 'ボトムス';
    return false;
  });

  const handleSelect = (id: number) => {
    if (step === 'outer') setSelectedOuter(id);
    if (step === 'tops') {
      setSelectedTops((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
    if (step === 'bottoms') setSelectedBottoms(id);
  };

  const handleNext = () => {
    if (step === 'outer' && selectedOuter !== null) setStep('tops');
    else if (step === 'tops' && selectedTops.length > 0) setStep('bottoms');
  };

  const handleSave = () => {
    localStorage.setItem(
      'tomorrowSelection',
      JSON.stringify({
        outer: selectedOuter,
        tops: selectedTops,
        bottoms: selectedBottoms,
      })
    );
    alert('明日着る服を保存しました！');
  };

  const getWeatherIcon = (code: number) => {
    if (code < 3) return '☀️';
    if (code < 50) return '☁️';
    return '🌧';
  };

  const getAdvice = (max: number) => {
    if (max < 10) return '🧥 アウター必須';
    if (max < 20) return '🧥 羽織があると安心';
    return '👕 薄着でもOK';
  };

  const stepTitle =
    step === 'outer'
      ? 'アウターを選んでください'
      : step === 'tops'
      ? 'トップスを選んでください（複数可）'
      : 'ボトムスを選んでください';

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        明日着る服を選ぶ 👕
      </h1>

      {showLocationGuide && (
        <div className="bg-yellow-100 text-sm text-center p-3 rounded mb-4">
          天気情報を表示するため、位置情報の許可をお願いします
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6 max-w-md mx-auto text-center">
        {weather ? (
          <>
            <p className="text-lg">
              {getWeatherIcon(weather.code)} 明日の気温
            </p>
            <p className="text-sm mt-1">
              最高 {weather.max}℃ / 最低 {weather.min}℃
            </p>
            <p className="mt-2 font-semibold text-orange-600">
              {getAdvice(weather.max)}
            </p>
          </>
        ) : weatherError ? (
          <p className="text-sm text-gray-500">天気情報を取得できません</p>
        ) : (
          <p className="text-sm text-gray-500">天気を取得中…</p>
        )}
      </div>

      <p className="text-center text-gray-600 mb-4">{stepTitle}</p>

      <div className="grid grid-cols-2 gap-4">
        {visibleClothes.map((item) => {
          const selected =
            step === 'outer'
              ? selectedOuter === item.id
              : step === 'tops'
              ? selectedTops.includes(item.id)
              : selectedBottoms === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`border rounded-lg p-2 cursor-pointer transition ${
                selected
                  ? 'bg-blue-200 border-blue-500'
                  : 'bg-white'
              }`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover mx-auto rounded mb-2"
              />
              <p className="text-sm text-center font-semibold">
                {item.name}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        {step !== 'bottoms' && (
          <button
            onClick={handleNext}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            次へ
          </button>
        )}

        {step === 'bottoms' && selectedBottoms !== null && (
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            保存
          </button>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          ホームに戻る
        </Link>
      </div>
    </main>
  );
}
