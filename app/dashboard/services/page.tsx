'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Clock, Tag, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  active: boolean;
  createdAt: string;
}

// Common service categories
const SERVICE_CATEGORIES = [
  '发型设计',
  '染发',
  '烫发',
  '护理',
  '美甲',
  '美容',
  '按摩',
  'SPA',
  '化妆',
  '皮肤护理',
  '其他',
];

export default function ServicesManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: '',
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.description || !formData.duration || !formData.price || !formData.category) {
      alert('请填写所有必填字段');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      alert('价格必须大于 0');
      return;
    }

    if (parseInt(formData.duration) <= 0) {
      alert('时长必须大于 0');
      return;
    }

    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchServices();
        closeModal();
      } else {
        const data = await response.json();
        alert(data.error || '保存失败');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      alert('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此服务吗？如果有未完成的预约，将无法删除。')) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchServices();
      } else {
        const data = await response.json();
        alert(data.message || data.error || '删除失败');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('删除失败');
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !service.active }),
      });

      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration.toString(),
        price: service.price.toString(),
        category: service.category,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        category: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    if (!showInactive && !service.active) return false;
    if (filterCategory !== 'all' && service.category !== filterCategory) return false;
    return true;
  });

  // Group by category
  const servicesByCategory = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">服务管理</h1>
          <p className="text-neutral-600 mt-2">管理您的服务项目和价格</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          添加服务
        </button>
      </div>

      {/* Filters */}
      <div className="card-glass mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              服务分类
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部分类</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showInactive
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              显示已停用
            </button>
          </div>
        </div>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="card-glass text-center py-16">
          <div className="w-16 h-16 bg-neutral-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Tag className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">还没有服务</h3>
          <p className="text-neutral-600 mb-6">添加您的第一个服务项目</p>
          <button onClick={() => openModal()} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            添加服务
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="card-glass text-center py-12">
          <p className="text-neutral-600">没有符合筛选条件的服务</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <div key={category}>
              <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary-600" />
                {category}
                <span className="text-sm font-normal text-neutral-500">
                  ({categoryServices.length})
                </span>
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryServices.map((service) => (
                  <div
                    key={service.id}
                    className={`card-glass ${!service.active && 'opacity-60'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1">{service.name}</h3>
                        {!service.active && (
                          <span className="inline-block px-2 py-0.5 bg-neutral-200 text-neutral-600 text-xs rounded">
                            已停用
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleActive(service)}
                        className={`p-2 rounded-lg transition-colors ${
                          service.active
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-neutral-400 hover:bg-neutral-100'
                        }`}
                        title={service.active ? '停用' : '启用'}
                      >
                        {service.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>

                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1 text-neutral-600">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} 分钟</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-primary-600" />
                        <span className="font-bold text-primary-600">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-neutral-200">
                      <button
                        onClick={() => openModal(service)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">
                {editingService ? '编辑服务' : '添加服务'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  服务名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：专业染发服务"
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  服务分类 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">选择分类</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    时长（分钟） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="60"
                    min="1"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    价格（$） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="50.00"
                    min="0.01"
                    step="0.01"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  服务描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="详细描述服务内容、效果等..."
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-neutral-200 rounded-xl font-semibold hover:bg-neutral-50 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-glow-lg transition-all"
                >
                  {editingService ? '保存更改' : '添加服务'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
