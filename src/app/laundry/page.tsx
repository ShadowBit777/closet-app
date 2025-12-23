'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Cloth {
  id: number;
  name: string;
  category: string;
  image: string;
}

export default function LaundryPage() {
  const [laundryClothes, setLaundryClothes] = useState<Cloth[]>([]);

  useEffect(() => {
    const clothes: Cloth[] = JSON.parse(
      localStorage.getItem('clothes') || '[]'
    );

    const laundryIds: number[] = JSON.parse(
      localStorage.getItem('laundryList') || '[]'
    );

    const filtered = clothes.filter((item) =>
      laundryIds.includes(item.id)
    );

    setLaundryClothes(filtered);
  }, []);

  // 🔶 tomorrowSelection を必ず number[] にする関数
  const normalizeTomorrowIds = (): number[] => {
    const raw = JSON.parse(
      localStorage.getItem('tomorrowSelection') || '[]'
    );

    if (Array.isArray(raw)) return raw;

    if (typeof raw === 'object' && raw !== null) {
      return Object.values(raw).flat() as number[];
    }

    return [];
  };

  // ✅ 個別：洗濯完了
  const handleDone = (id: number) => {
    /* --- 洗濯リスト更新 --- */
    const laundryIds: number[] = JSON.parse(
      localStorage.getItem('laundryList') || '[]'
    );

    const updatedLaundryIds = laundryIds.filter(
      (i) => i !== id
    );
    localStorage.setItem(
      'laundryList',
      JSON.stringify(updatedLaundryIds)
    );

    /* --- 明日着る服からも削除 --- */
    const tomorrowIds = normalizeTomorrowIds();
    const updatedTomorrowIds = tomorrowIds.filter(
      (i) => i !== id
    );

    localStorage.setItem(
      'tomorrowSelection',
      JSON.stringify(updatedTomorrowIds)
    );

    /* --- 画面更新 --- */
    setLaundryClothes((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // ✅ 一括リセット
  const handleResetAll = () => {
    if (!confirm('洗濯リストをすべてリセットしますか？')) return;

    localStorage.setItem('laundryList', JSON.stringify([]));
    localStorage.setItem('tomorrowSelection', JSON.stringify([]));

    setLaundryClothes([]);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-4">
        洗濯リスト 🧺
      </h1>

      {laundryClothes.length > 0 && (
        <div className="flex justify-center mb-6">
          <button
            onClick={handleResetAll}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm"
          >
            一括リセット
          </button>
        </div>
      )}

      {laundryClothes.length === 0 ? (
        <p className="text-center text-gray-500">
          洗濯予定の服はありません
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {laundryClothes.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow p-3 flex flex-col items-center"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded mb-2"
              />

              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-xs text-gray-500 mb-2">
                {item.category}
              </p>

              <button
                onClick={() => handleDone(item.id)}
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                洗濯完了
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-center">
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
