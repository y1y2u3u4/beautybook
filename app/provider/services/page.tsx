'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, DollarSign, Edit, Trash2, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  active: boolean;
}

// Mock services for demo mode
const mockServices: Service[] = [
  { id: '1', name: 'Hydrating Facial', description: 'Deep cleansing and hydrating facial treatment for all skin types', duration: 60, price: 150, category: 'Facial', active: true },
  { id: '2', name: 'Anti-Aging Treatment', description: 'Advanced anti-aging treatment with peptides and retinol', duration: 90, price: 300, category: 'Facial', active: true },
  { id: '3', name: 'Chemical Peel', description: 'Professional chemical peel for skin rejuvenation', duration: 45, price: 250, category: 'Skin Treatment', active: true },
  { id: '4', name: 'Microdermabrasion', description: 'Exfoliating treatment to improve skin texture', duration: 60, price: 180, category: 'Skin Treatment', active: false },
];

const CATEGORIES = ['Facial', 'Skin Treatment', 'Massage', 'Hair Cutting', 'Hair Coloring', 'Hair Styling', 'Nails', 'Makeup', 'Other'];

export default function ProviderServicesPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Facial',
    duration: 60,
    price: 100,
    active: true,
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchServices();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      // First sync user to ensure they exist in the database
      await fetch('/api/users/sync', { method: 'POST' });

      // For now, use mock data since we need provider ID from the provider profile
      // In production, this would fetch from /api/services?providerId=xxx
      setServices(mockServices);
      setDataSource('mock');
    } catch (err: any) {
      console.error('Failed to fetch services:', err);
      setServices(mockServices);
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!formData.name || !formData.description || !formData.duration || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setServices([...services, data.service]);
        setShowAddModal(false);
        resetForm();
      } else {
        // For demo, add locally
        const newService: Service = {
          id: `temp_${Date.now()}`,
          ...formData,
        };
        setServices([...services, newService]);
        setShowAddModal(false);
        resetForm();
      }
    } catch (err: any) {
      // For demo, add locally
      const newService: Service = {
        id: `temp_${Date.now()}`,
        ...formData,
      };
      setServices([...services, newService]);
      setShowAddModal(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleEditService = async () => {
    if (!selectedService || !formData.name || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/${selectedService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setServices(services.map(s => s.id === selectedService.id ? data.service : s));
      } else {
        // Update locally for demo
        setServices(services.map(s => s.id === selectedService.id ? { ...s, ...formData } : s));
      }
      setShowEditModal(false);
      setSelectedService(null);
      resetForm();
    } catch (err: any) {
      // Update locally for demo
      setServices(services.map(s => s.id === selectedService.id ? { ...s, ...formData } : s));
      setShowEditModal(false);
      setSelectedService(null);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/${selectedService.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setServices(services.filter(s => s.id !== selectedService.id));
      } else {
        // Delete locally for demo
        setServices(services.filter(s => s.id !== selectedService.id));
      }
      setShowDeleteModal(false);
      setSelectedService(null);
    } catch (err: any) {
      // Delete locally for demo
      setServices(services.filter(s => s.id !== selectedService.id));
      setShowDeleteModal(false);
      setSelectedService(null);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Facial',
      duration: 60,
      price: 100,
      active: true,
    });
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      duration: service.duration,
      price: service.price,
      active: service.active,
    });
    setShowEditModal(true);
  };

  const filteredServices = services.filter(service => {
    if (filter === 'active') return service.active;
    if (filter === 'inactive') return !service.active;
    return true;
  });

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-neutral-600">Loading services...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">BeautyBook</h1>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/provider/dashboard" className="text-neutral-600 hover:text-primary-600 transition-colors">Dashboard</Link>
              <Link href="/provider/services" className="text-primary-600 font-medium">Services</Link>
              <Link href="/provider/appointments" className="text-neutral-600 hover:text-primary-600 transition-colors">Appointments</Link>
            </nav>
            <div className="flex items-center gap-4">
              <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
              <SignedOut><Link href="/sign-in" className="btn-primary px-6 py-2">Sign In</Link></SignedOut>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Services Management</h1>
            <p className="text-neutral-600 mt-1">Manage your services and pricing</p>
          </div>
          <Link href="/provider/dashboard" className="text-primary-600 hover:text-primary-700 font-semibold">← Back to Dashboard</Link>
        </div>

        {/* Error/Demo Badge */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600">×</button>
          </div>
        )}

        {dataSource === 'mock' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-yellow-600">&#x26A0;</span>
            <div>
              <p className="font-semibold text-yellow-800">Demo Mode</p>
              <p className="text-sm text-yellow-700">Changes are temporary and will reset on page refresh.</p>
            </div>
          </div>
        )}

        <SignedIn>
          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-700">Filter:</span>
                {(['all', 'active', 'inactive'] as const).map((status) => (
                  <button key={status} onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === status ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={() => { resetForm(); setShowAddModal(true); }}
                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                <Plus className="w-5 h-5" />Add New Service
              </button>
            </div>
          </div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
              <Clock className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No services found</h3>
              <p className="text-neutral-600 mb-6">Add your first service to start accepting bookings.</p>
              <button onClick={() => { resetForm(); setShowAddModal(true); }}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700">Add Service</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-neutral-900">{service.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${service.active ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-600'}`}>
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-3">{service.description}</p>
                      <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">{service.category}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <div>
                        <div className="text-xs text-neutral-600">Duration</div>
                        <div className="font-semibold text-neutral-900">{service.duration} min</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-neutral-500" />
                      <div>
                        <div className="text-xs text-neutral-600">Price</div>
                        <div className="font-semibold text-green-600">${service.price}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(service)}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                      <Edit className="w-4 h-4" />Edit
                    </button>
                    <button onClick={() => { setSelectedService(service); setShowDeleteModal(true); }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SignedIn>

        <SignedOut>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <Clock className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Sign in to manage services</h3>
            <p className="text-neutral-600 mb-6">Please sign in to add and manage your services.</p>
            <Link href="/sign-in" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700">Sign In</Link>
          </div>
        </SignedOut>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">Add New Service</h2>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Service Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Hydrating Facial" className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Description *</label>
                    <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed description..." className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Category *</label>
                      <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Duration (min) *</label>
                      <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Price ($) *</label>
                      <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded border-neutral-300" />
                      <span className="font-semibold text-neutral-700">Active (visible to customers)</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-neutral-200">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200">Cancel</button>
                <button onClick={handleAddService} disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}Add Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">Edit Service</h2>
                <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Service Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Description *</label>
                    <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Category *</label>
                      <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Duration (min) *</label>
                      <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Price ($) *</label>
                      <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded border-neutral-300" />
                      <span className="font-semibold text-neutral-700">Active (visible to customers)</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-neutral-200">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200">Cancel</button>
                <button onClick={handleEditService} disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Delete Service?</h2>
                <p className="text-neutral-600 mb-6">Are you sure you want to delete <strong>{selectedService.name}</strong>? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200">Cancel</button>
                  <button onClick={handleDeleteService} disabled={saving}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
