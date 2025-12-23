'use client';
import { useState, useEffect } from "react";
import Link from "next/link";

interface ClothingItem {
  id: number;
  name: string;
  category: string;
  image: string;
}

export default function MyCloset() {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ClothingItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImage, setEditImage] = useState("");

  // 🔹検索・カテゴリ絞り込み用
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("clothes");
    if (saved) setClothes(JSON.parse(saved));
  }, []);

  const handleDelete = (id: number) => {
    const updated = clothes.filter((item) => item.id !== id);
    setClothes(updated);
    localStorage.setItem("clothes", JSON.stringify(updated));
    setDeletingItem(null);
  };

  const handleEdit = (item: ClothingItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditImage(item.image);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setEditImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!editingItem) return;
    const updated = clothes.map((item) =>
      item.id === editingItem.id
        ? { ...item, name: editName, category: editCategory, image: editImage }
        : item
    );
    setClothes(updated);
    localStorage.setItem("clothes", JSON.stringify(updated));
    setEditingItem(null);
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % clothes.length : null
    );
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + clothes.length) % clothes.length : null
    );
  };

  // 🔹検索とカテゴリフィルタを適用した表示リスト
  const filteredClothes = clothes.filter((item) => {
    const matchCategory = filterCategory ? item.category === filterCategory : true;
    const matchSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">マイクローゼット 👚</h1>

      {/* 🔹検索バーとカテゴリ絞り込み */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="服の名前で検索"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border p-2 rounded w-full sm:w-48"
        >
          <option value="">全てのカテゴリ</option>
          <option value="トップス">トップス</option>
          <option value="ボトムス">ボトムス</option>
          <option value="アウター">アウター</option>
          <option value="シューズ">シューズ</option>
          <option value="アクセサリー">アクセサリー</option>
        </select>
      </div>

      {/* 🔹服一覧 */}
      {filteredClothes.length === 0 ? (
        <p className="text-center text-gray-600">条件に一致する服はありません。</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredClothes.map((item, index) => (
            <div key={item.id} className="bg-white shadow rounded-lg p-4 flex flex-col items-center">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded mb-3 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedIndex(index)}
                />
              )}
              <p className="font-semibold">{item.name}</p>
              <p className="text-gray-500 text-sm mb-3">{item.category}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  編集
                </button>
                <button
                  onClick={() => setDeletingItem(item)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔹ホーム・登録ページ遷移ボタン */}
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          ホームに戻る
        </Link>
        <Link
          href="/add-clothes"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          服を追加
        </Link>
      </div>

      {/* 編集モーダル */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">服を編集</h2>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="服の名前"
              className="border p-2 w-full mb-2 rounded"
            />
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="border p-2 w-full mb-2 rounded"
            >
              <option value="トップス">トップス</option>
              <option value="ボトムス">ボトムス</option>
              <option value="アウター">アウター</option>
              <option value="シューズ">シューズ</option>
              <option value="アクセサリー">アクセサリー</option>
            </select>
            {editImage && (
              <img
                src={editImage}
                alt="preview"
                className="w-32 h-32 object-cover mx-auto rounded mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-600 mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <p className="mb-4">
              「{deletingItem.name}」を削除しますか？<br />
              この操作は取り消せません。
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeletingItem(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deletingItem.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 画像拡大モーダル */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative">
            <img
              src={clothes[selectedIndex].image}
              alt={clothes[selectedIndex].name}
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg"
            />
            <p className="text-center text-white mt-4">
              {clothes[selectedIndex].name}（{clothes[selectedIndex].category}）
            </p>
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-full font-bold text-xl"
            >
              ×
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); showPrev(e); }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-black px-3 py-2 rounded-full text-2xl"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); showNext(e); }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-black px-3 py-2 rounded-full text-2xl"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
