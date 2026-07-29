"use client";
import { useState, useEffect } from 'react';
import type { Post } from '@/app/lib/definitions';
import { CameraIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function ImageFeed() {
  const [images, setImages] = useState<Post[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    const json = await res.json();
    if (json.data) setImages(json.data);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await fetch('/api/posts');
      const json = await res.json();
      if (!mounted) return;
      if (json.data) setImages(json.data);
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;
      const imageBase64 = await toBase64(file);

      const formData = new FormData();
      formData.append('imageBase64', imageBase64);
      formData.append('caption', 'My handcrafted masterpiece!');

      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.error) {
        alert(json.error);
        return;
      }
      fetchPosts();
    } catch (error) {
      alert('Error uploading!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-8">
      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-dashed border-gray-200 text-center">
        <label className="cursor-pointer flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <CameraIcon className="w-8 h-8" />
          </div>
          <span className="font-bold text-gray-700">
            {uploading ? 'Uploading...' : 'Post a Photo'}
          </span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={uploadImage} 
            disabled={uploading} 
          />
        </label>
      </div>

      <div className="space-y-6">
        <h3 className="font-bold text-xl text-gray-800">Community Gallery</h3>
        {images.map((post: Post) => (
          <div key={post.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
            <img 
              src={post.image_url} 
              alt="Craft" 
              className="w-full aspect-square object-cover"
            />
            <div className="p-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">{post.caption}</p>
              <button className="flex items-center gap-1 text-red-500 font-bold">
                 <HeartIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

