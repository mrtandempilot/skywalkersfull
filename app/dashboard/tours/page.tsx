'use client';

import { useState, useEffect } from 'react';
import { Tour } from '@/types/tour';

export default function ToursManagement() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_tr: '',
    slug: '',
    category: 'Sky' as 'Sky' | 'Land' | 'Water',
    short_description: '',
    short_description_tr: '',
    full_description: '',
    full_description_tr: '',
    price_adult: 0,
    price_child: 0,
    currency: 'TRY' as 'TRY' | 'USD' | 'EUR',
    duration: '',
    start_times: '',
    meeting_point: '',
    meeting_point_tr: '',
    pickup_available: true,
    age_limit: '',
    fitness_level: '',
    included: '',
    included_tr: '',
    not_included: '',
    not_included_tr: '',
    what_to_bring: '',
    what_to_bring_tr: '',
    image_url: '',
    gallery_urls: '',
    is_active: true,
  });

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours');
      if (response.ok) {
        const data = await response.json();
        setTours(data);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await handleImageUpload(file);
      setFormData({ ...formData, image_url: url });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      const uploadPromises = Array.from(files).map(file => handleImageUpload(file));
      const urls = await Promise.all(uploadPromises);
      
      const currentUrls = formData.gallery_urls ? formData.gallery_urls.split('\n') : [];
      const newUrls = [...currentUrls, ...urls].join('\n');
      setFormData({ ...formData, gallery_urls: newUrls });
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tourData = {
      ...formData,
      price_adult: Number(formData.price_adult),
      price_child: formData.price_child ? Number(formData.price_child) : null,
      start_times: formData.start_times ? formData.start_times.split(',').map(t => t.trim()) : null,
      included: formData.included.split('\n').filter(i => i.trim()),
      included_tr: formData.included_tr.split('\n').filter(i => i.trim()),
      not_included: formData.not_included ? formData.not_included.split('\n').filter(i => i.trim()) : null,
      not_included_tr: formData.not_included_tr ? formData.not_included_tr.split('\n').filter(i => i.trim()) : null,
      what_to_bring: formData.what_to_bring.split('\n').filter(i => i.trim()),
      what_to_bring_tr: formData.what_to_bring_tr.split('\n').filter(i => i.trim()),
      gallery_urls: formData.gallery_urls ? formData.gallery_urls.split('\n').filter(u => u.trim()) : null,
    };

    try {
      const url = editingTour ? `/api/tours?id=${editingTour.id}` : '/api/tours';
      const method = editingTour ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tourData),
      });

      if (response.ok) {
        await fetchTours();
        setShowModal(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Error saving tour');
    }
  };

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      name: tour.name,
      name_tr: tour.name_tr,
      slug: tour.slug,
      category: tour.category,
      short_description: tour.short_description,
      short_description_tr: tour.short_description_tr,
      full_description: tour.full_description || '',
      full_description_tr: tour.full_description_tr || '',
      price_adult: tour.price_adult,
      price_child: tour.price_child || 0,
      currency: tour.currency,
      duration: tour.duration,
      start_times: tour.start_times ? tour.start_times.join(', ') : '',
      meeting_point: tour.meeting_point || '',
      meeting_point_tr: tour.meeting_point_tr || '',
      pickup_available: tour.pickup_available,
      age_limit: tour.age_limit || '',
      fitness_level: tour.fitness_level || '',
      included: tour.included.join('\n'),
      included_tr: tour.included_tr.join('\n'),
      not_included: tour.not_included ? tour.not_included.join('\n') : '',
      not_included_tr: tour.not_included_tr ? tour.not_included_tr.join('\n') : '',
      what_to_bring: tour.what_to_bring.join('\n'),
      what_to_bring_tr: tour.what_to_bring_tr.join('\n'),
      image_url: tour.image_url,
      gallery_urls: tour.gallery_urls ? tour.gallery_urls.join('\n') : '',
      is_active: tour.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    try {
      const response = await fetch(`/api/tours?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTours();
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
    }
  };

  const toggleActive = async (tour: Tour) => {
    try {
      const response = await fetch(`/api/tours?id=${tour.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tour, is_active: !tour.is_active }),
      });

      if (response.ok) {
        await fetchTours();
      }
    } catch (error) {
      console.error('Error toggling tour status:', error);
    }
  };

  const resetForm = () => {
    setEditingTour(null);
    setFormData({
      name: '',
      name_tr: '',
      slug: '',
      category: 'Sky',
      short_description: '',
      short_description_tr: '',
      full_description: '',
      full_description_tr: '',
      price_adult: 0,
      price_child: 0,
      currency: 'TRY',
      duration: '',
      start_times: '',
      meeting_point: '',
      meeting_point_tr: '',
      pickup_available: true,
      age_limit: '',
      fitness_level: '',
      included: '',
      included_tr: '',
      not_included: '',
      not_included_tr: '',
      what_to_bring: '',
      what_to_bring_tr: '',
      image_url: '',
      gallery_urls: '',
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tours Management</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add New Tour
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tours.map((tour) => (
                <tr key={tour.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={tour.image_url}
                        alt={tour.name}
                        className="h-10 w-10 rounded object-cover mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tour.name}</div>
                        <div className="text-sm text-gray-500">{tour.name_tr}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {tour.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tour.price_adult} {tour.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tour.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={tour.is_active ? 'active' : 'inactive'}
                      onChange={(e) => {
                        const newStatus = e.target.value === 'active';
                        toggleActive(tour);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                        tour.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(tour)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tour.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingTour ? 'Edit Tour' : 'Add New Tour'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tour Name (English)*
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tour Name (Turkish)*
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name_tr}
                      onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug*
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="paragliding-oludeniz"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category*
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Sky' | 'Land' | 'Water' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                      <option value="Sky">Sky</option>
                      <option value="Land">Land</option>
                      <option value="Water">Water</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description (English)*
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description (Turkish)*
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.short_description_tr}
                      onChange={(e) => setFormData({ ...formData, short_description_tr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description (English)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.full_description}
                      onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description (Turkish)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.full_description_tr}
                      onChange={(e) => setFormData({ ...formData, full_description_tr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adult Price*
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price_adult}
                      onChange={(e) => setFormData({ ...formData, price_adult: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Child Price
                    </label>
                    <input
                      type="number"
                      value={formData.price_child}
                      onChange={(e) => setFormData({ ...formData, price_child: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency*
                    </label>
                    <select
                      required
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'TRY' | 'USD' | 'EUR' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration*
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="2 hours"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Times (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.start_times}
                      onChange={(e) => setFormData({ ...formData, start_times: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="09:00, 11:00, 14:00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Limit
                    </label>
                    <input
                      type="text"
                      value={formData.age_limit}
                      onChange={(e) => setFormData({ ...formData, age_limit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="6-65 years"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Image*
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      disabled={uploadingImage}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                    {formData.image_url && (
                      <div className="relative w-32 h-32">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <input
                      type="url"
                      placeholder="Or paste image URL"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gallery Images
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesChange}
                      disabled={uploadingImage}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                    {formData.gallery_urls && formData.gallery_urls.split('\n').filter(u => u.trim()).length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {formData.gallery_urls.split('\n').filter(u => u.trim()).map((url, index) => (
                          <div key={index} className="relative w-full h-24">
                            <img
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const urls = formData.gallery_urls.split('\n').filter((u, i) => i !== index);
                                setFormData({ ...formData, gallery_urls: urls.join('\n') });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea
                      rows={3}
                      placeholder="Or paste image URLs (one per line)"
                      value={formData.gallery_urls}
                      onChange={(e) => setFormData({ ...formData, gallery_urls: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's Included (English, one per line)*
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.included}
                      onChange={(e) => setFormData({ ...formData, included: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's Included (Turkish, one per line)*
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.included_tr}
                      onChange={(e) => setFormData({ ...formData, included_tr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What to Bring (English, one per line)*
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.what_to_bring}
                      onChange={(e) => setFormData({ ...formData, what_to_bring: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What to Bring (Turkish, one per line)*
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.what_to_bring_tr}
                      onChange={(e) => setFormData({ ...formData, what_to_bring_tr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pickup_available"
                    checked={formData.pickup_available}
                    onChange={(e) => setFormData({ ...formData, pickup_available: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pickup_available" className="ml-2 block text-sm text-gray-900">
                    Pickup Available
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? 'Uploading...' : editingTour ? 'Update Tour' : 'Create Tour'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
