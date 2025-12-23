'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 追加

interface Cloth {
  id: number;
  name: string;
  category: string;
  image: string; // base64 に統一
}

export default function AddClothesPage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [clothes, setClothes] = useState<Cloth[]>([]);
  const router = useRouter(); // 追加

  useEffect(() => {
    const saved = localStorage.getItem('clothes');
    if (saved) setClothes(JSON.parse(saved));
  }, []);

  const handleAdd = () => {
    if (!name) return alert('服の名前を入力してください');
    if (!category) return alert('カテゴリを選択してください');
    if (!image) return alert('画像を選択してください');

    const reader = new FileReader();
    reader.onload = () => {
      const imageBase64 = reader.result as string;

      const newItem: Cloth = {
        id: Date.now(),
        name,
        category,
        image: imageBase64,
      };

      const updated = [...clothes, newItem];
      setClothes(updated);
      localStorage.setItem('clothes', JSON.stringify(updated));

      // 入力リセット
      setName('');
      setCategory('');
      setImage(null);

      // 登録完了後にマイクローゼットへ遷移
      router.push('/my-closet');
    };

    reader.readAsDataURL(image); // base64 に変換
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">服を登録する</h1>

      {/* 登録フォーム */}
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md mb-10">
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700">名前</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 w-full p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="例：白いシャツ"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700">カテゴリ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 w-full p-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">選択してください</option>
            <option value="トップス">アウター</option>
            <option value="ボトムス">トップス</option>
            <option value="アウター">ボトムス</option>
            <option value="シューズ">シューズ</option>
            <option value="シューズ">キャップ</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700">画像</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-600 mb-3"
          />
          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="プレビュー"
              className="w-32 h-32 object-cover rounded-md border mx-auto"
            />
          )}
        </div>

        <button
          onClick={handleAdd}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full transition-all"
        >
          登録する
        </button>
      </div>

      {/* ホームとマイクローゼットへの遷移 */}
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          ホームに戻る
        </Link>

        <Link
          href="/my-closet"
          className="bg-yellow-800 hover:bg-yellow-900 text-white px-4 py-2 rounded-lg"
        >
          マイクローゼットを見る
        </Link>
      </div>
    </main>
  );
}
