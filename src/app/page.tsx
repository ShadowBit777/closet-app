'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // ★ 追加（超重要）

interface Cloth {
  id: number;
  name: string;
  category: string;
  image: string;
}

export default function Home() {
  const [tomorrowClothes, setTomorrowClothes] = useState<Cloth[]>([]);
  const [laundryIds, setLaundryIds] = useState<number[]>([]);

  useEffect(() => {
    // ★ ブラウザでのみ実行させる
    if (typeof window === 'undefined') return;

    const clothes: Cloth[] = JSON.parse(
      localStorage.getItem('clothes') || '[]'
    );

    const rawSelection = JSON.parse(
      localStorage.getItem('tomorrowSelection') || '{}'
    );

    const selectedIds: number[] = Array.isArray(rawSelection)
      ? rawSelection
      : (Object.values(rawSelection).flat() as number[]);

    const selectedClothes = clothes.filter((item) =>
      selectedIds.includes(item.id)
    );

    setTomorrowClothes(selectedClothes);

    const storedLaundry: number[] = JSON.parse(
      localStorage.getItem('laundryList') || '[]'
    );
    setLaundryIds(storedLaundry);
  }, []);

  const addToLaundry = (clothId: number) => {
    if (laundryIds.includes(clothId)) return;

    const updatedLaundry = [...laundryIds, clothId];
    setLaundryIds(updatedLaundry);
    localStorage.setItem('laundryList', JSON.stringify(updatedLaundry));

    setTomorrowClothes((prev) =>
      prev.filter((item) => item.id !== clothId)
    );
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">コーデ管理アプリ</h1>

      <section className="w-full max-w-4xl mb-8">
        <h2 className="text-xl font-bold mb-4 text-center">
          明日着る服 👕
        </h2>

        {tomorrowClothes.length === 0 ? (
          <p className="text-center text-gray-500">
            明日着る服はまだ選ばれていません
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {tomorrowClothes.map((item) => (
              <div
                key={item.id}
                className="relative bg-white rounded-lg shadow p-3 flex flex-col items-center"
              >
                <button
                  onClick={() => addToLaundry(item.id)}
                  className="absolute top-1 right-1 text-xs px-2 py-1 rounded
                             bg-orange-500 text-white hover:bg-orange-600"
                >
                  洗濯
                </button>

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded mb-2"
                />
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex gap-6 mb-6">
        <Link
          href="/tomorrow-wear"
          className="w-48 h-24 bg-white shadow rounded-lg flex items-center justify-center text-center hover:bg-gray-200 transition"
        >
          👖 明日着る服を選ぶ
        </Link>
      </div>

      <div className="flex gap-4">
        <Link
          href="/add-clothes"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          服を登録する
        </Link>

        <Link
          href="/my-closet"
          className="bg-yellow-800 hover:bg-yellow-900 text-white px-4 py-2 rounded-lg"
        >
          マイクローゼットを見る
        </Link>

        <Link
          href="/laundry"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          洗濯リスト
        </Link>
      </div>
    </main>
  );
}
