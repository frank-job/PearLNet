'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { X, Image, Loader2, Trash2 } from 'lucide-react';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books',
  'Vehicles', 'Toys & Games', 'Beauty', 'Automotive', 'Other'
];

const CONDITIONS = [
  'new', 'like_new', 'good', 'fair', 'poor'
];

export default function EditListing() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [condition, setCondition] = useState('good');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/marketplace/${listingId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const listing = data.data;
          setTitle(listing.title || '');
          setDescription(listing.description || '');
          setCategory(listing.category || 'Electronics');
          setPrice(String(listing.price || ''));
          setCurrency(listing.currency || 'USD');
          setCondition(listing.condition || 'good');
          setLocation(listing.location || '');
          if (listing.image_url) {
            setExistingImage(listing.image_url);
            setImagePreviews([listing.image_url]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 1 - images.length; // Only 1 main image for simplicity
    const newFiles = files.slice(0, remainingSlots);
    
    newFiles.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews([reader.result as string]);
        setExistingImage(null);
      };
      reader.readAsDataURL(file);
    });
    setImages(prev => [...prev.slice(0, 0), ...newFiles]);
  };

  const removeImage = () => {
    setImages([]);
    setImagePreviews([]);
    setExistingImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Valid price is required');
      setSaving(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    if (description.trim()) formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('price', price);
    formData.append('currency', currency);
    formData.append('condition', condition);
    if (location.trim()) formData.append('location', location.trim());
    
    images.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await fetch(`/api/marketplace/${listingId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update listing');
      }

      router.push('/PearLNet/marketplace');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/marketplace/${listingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete listing');
      }

      router.push('/PearLNet/marketplace');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </main>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
          PearlNet
        </h1>
        <p className="text-sm text-muted mt-1">Edit listing</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 p-4 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you selling?"
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item..."
            rows={4}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            maxLength={2000}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium mb-2">
              Condition
            </label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CONDITIONS.map(cond => (
                <option key={cond} value={cond}>{cond.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium mb-2">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Photo
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {(imagePreviews[0] || existingImage) && (
              <div className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
                <img src={imagePreviews[0] || existingImage!} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {!(imagePreviews[0] || existingImage) && (
              <label className="flex-shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-surface-strong transition-colors">
                <Image className="w-8 h-8 text-muted" />
                <span className="text-xs text-muted mt-1">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-xs text-muted mt-2">Max 1 image, 5MB</p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-surface-strong transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

        <div className="pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}