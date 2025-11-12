'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck, UserX, Loader2, X } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  title: string;
  bio?: string;
  specialties: string[];
  active: boolean;
  createdAt: string;
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    bio: '',
    specialties: [] as string[],
  });
  const [specialtyInput, setSpecialtyInput] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      setStaff(data.staff || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff';
      const method = editingStaff ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchStaff();
        closeModal();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save staff');
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Failed to save staff');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此员工吗？如果该员工有已分配的预约，将无法删除。')) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStaff();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete staff');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff');
    }
  };

  const toggleActive = async (staff: Staff) => {
    try {
      const response = await fetch(`/api/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !staff.active }),
      });

      if (response.ok) {
        await fetchStaff();
      }
    } catch (error) {
      console.error('Error toggling staff status:', error);
    }
  };

  const openModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        email: staff.email,
        phone: staff.phone || '',
        title: staff.title,
        bio: staff.bio || '',
        specialties: staff.specialties || [],
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        title: '',
        bio: '',
        specialties: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setSpecialtyInput('');
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialtyInput.trim()],
      });
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty),
    });
  };

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
          <h1 className="text-3xl font-bold text-neutral-900">员工管理</h1>
          <p className="text-neutral-600 mt-2">管理您的团队成员</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          添加员工
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="card-glass text-center py-16">
          <div className="w-16 h-16 bg-neutral-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserCheck className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">还没有员工</h3>
          <p className="text-neutral-600 mb-6">添加您的第一个团队成员来开始管理预约</p>
          <button onClick={() => openModal()} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            添加员工
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="card-glass">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center font-semibold text-primary-700">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{member.name}</h3>
                    <p className="text-sm text-neutral-600">{member.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(member)}
                    className={`p-2 rounded-lg transition-colors ${
                      member.active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-neutral-400 hover:bg-neutral-100'
                    }`}
                    title={member.active ? '在职' : '离职'}
                  >
                    {member.active ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-neutral-600">
                  <span className="font-medium">邮箱:</span> {member.email}
                </p>
                {member.phone && (
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">电话:</span> {member.phone}
                  </p>
                )}
              </div>

              {member.specialties.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-2">专长</p>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-lg"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {member.bio && (
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{member.bio}</p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => openModal(member)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
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
                {editingStaff ? '编辑员工' : '添加员工'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    职位 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如: 高级发型师"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    邮箱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    电话
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  专长
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                    placeholder="例如: 染发、烫发"
                    className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    添加
                  </button>
                </div>
                {formData.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-lg"
                      >
                        {specialty}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          className="hover:text-primary-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  简介
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="介绍员工的背景、经验等..."
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                  {editingStaff ? '保存更改' : '添加员工'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
