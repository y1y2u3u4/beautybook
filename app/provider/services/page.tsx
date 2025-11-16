'use client';

import { useTestUser } from '@/hooks/useTestUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, DollarSign, Edit, Trash2, Plus, X } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  active: boolean;
}

export default function ProviderServices() {
  const { testUser, isTestMode, isLoading } = useTestUser();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    if (!isLoading && (!isTestMode || testUser?.role !== 'PROVIDER')) {
      router.push('/test-mode');
    }
  }, [isLoading, isTestMode, testUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!testUser || testUser.role !== 'PROVIDER') {
    return null;
  }

  const services: Service[] = [
    {
      id: '1',
      name: 'Hydrating Facial',
      description: 'Deep cleansing and hydrating facial treatment for all skin types',
      duration: 60,
      price: 150,
      category: 'Facial',
      active: true,
    },
    {
      id: '2',
      name: 'Anti-Aging Treatment',
      description: 'Advanced anti-aging treatment with peptides and retinol',
      duration: 90,
      price: 300,
      category: 'Facial',
      active: true,
    },
    {
      id: '3',
      name: 'Chemical Peel',
      description: 'Professional chemical peel for skin rejuvenation',
      duration: 45,
      price: 250,
      category: 'Skin Treatment',
      active: true,
    },
    {
      id: '4',
      name: 'Microdermabrasion',
      description: 'Exfoliating treatment to improve skin texture',
      duration: 60,
      price: 180,
      category: 'Skin Treatment',
      active: false,
    },
  ];

  const filteredServices = services.filter(service => {
    if (filter === 'active') return service.active;
    if (filter === 'inactive') return !service.active;
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Services Management</h1>
              <p className="text-neutral-600 mt-1">Manage your services and pricing</p>
            </div>
            <Link
              href="/provider/dashboard"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-700">Filter:</span>
              {(['all', 'active', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    filter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Service
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-neutral-900">
                      {service.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        service.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    {service.description}
                  </p>
                  <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                    {service.category}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 bg-neutral-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Duration</div>
                    <div className="font-semibold text-neutral-900">
                      {service.duration} min
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Price</div>
                    <div className="font-semibold text-green-600">
                      ${service.price}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setShowEditModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setShowDeleteModal(true);
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">Add New Service</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Hydrating Facial"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detailed description of the service..."
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Category *
                      </label>
                      <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <option value="Facial">Facial</option>
                        <option value="Skin Treatment">Skin Treatment</option>
                        <option value="Massage">Massage</option>
                        <option value="Hair">Hair</option>
                        <option value="Nails">Nails</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Duration (min) *
                      </label>
                      <input
                        type="number"
                        placeholder="60"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        placeholder="150"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Status
                    </label>
                    <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="active">Active (visible to customers)</option>
                      <option value="inactive">Inactive (hidden from customers)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-neutral-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('In production, this would add the service to the database');
                    setShowAddModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Add Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Service Modal */}
        {showEditModal && selectedService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">Edit Service</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedService.name}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      defaultValue={selectedService.description}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Category *
                      </label>
                      <select
                        defaultValue={selectedService.category}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="Facial">Facial</option>
                        <option value="Skin Treatment">Skin Treatment</option>
                        <option value="Massage">Massage</option>
                        <option value="Hair">Hair</option>
                        <option value="Nails">Nails</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Duration (min) *
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedService.duration}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedService.price}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Status
                    </label>
                    <select
                      defaultValue={selectedService.active ? 'active' : 'inactive'}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="active">Active (visible to customers)</option>
                      <option value="inactive">Inactive (hidden from customers)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-neutral-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('In production, this would update the service in the database');
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Delete Service?
                </h2>
                <p className="text-neutral-600 mb-6">
                  Are you sure you want to delete <strong>{selectedService.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('In production, this would delete the service from the database');
                      setShowDeleteModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Mode Notice */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧪</div>
            <div>
              <div className="font-bold text-yellow-900 mb-1">
                Test Mode - Services Management
              </div>
              <p className="text-yellow-800 text-sm">
                These are sample services. In production, you can add, edit, and delete services. Changes will be saved to the database and visible to customers browsing your profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
