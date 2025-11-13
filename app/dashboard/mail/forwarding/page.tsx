'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ForwardingConfig {
  id: string;
  name: string;
  description?: string;
  from_domains: string[];
  to_emails: string[];
  conditions: any;
  auto_archive: boolean;
  auto_reply_enabled: boolean;
  auto_reply_template?: string;
  is_active: boolean;
  created_at: string;
}

export default function EmailForwardingPage() {
  const [configs, setConfigs] = useState<ForwardingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ForwardingConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    from_domains: [''],
    to_emails: [''],
    conditions: {
      subject_pattern: '',
      min_priority: 'normal'
    },
    auto_archive: false,
    auto_reply_enabled: false,
    auto_reply_template: '',
    is_active: true
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_forwarding_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching forwarding configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      from_domains: [''],
      to_emails: [''],
      conditions: {
        subject_pattern: '',
        min_priority: 'normal'
      },
      auto_archive: false,
      auto_reply_enabled: false,
      auto_reply_template: '',
      is_active: true
    });
    setEditingConfig(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Clean up empty domains and emails
      const cleanedData = {
        ...formData,
        from_domains: formData.from_domains.filter(d => d.trim()),
        to_emails: formData.to_emails.filter(e => e.trim()),
        conditions: {
          ...formData.conditions,
          subject_pattern: formData.conditions.subject_pattern.trim() || null,
          min_priority: formData.conditions.min_priority || null
        }
      };

      if (editingConfig) {
        // Update existing config
        const { error } = await supabase
          .from('email_forwarding_config')
          .update(cleanedData)
          .eq('id', editingConfig.id);

        if (error) throw error;
      } else {
        // Create new config
        const { error } = await supabase
          .from('email_forwarding_config')
          .insert(cleanedData);

        if (error) throw error;
      }

      await fetchConfigs();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving forwarding config:', error);
      alert('Error saving configuration. Please try again.');
    }
  };

  const handleEdit = (config: ForwardingConfig) => {
    setFormData({
      name: config.name,
      description: config.description || '',
      from_domains: config.from_domains.length > 0 ? config.from_domains : [''],
      to_emails: config.to_emails.length > 0 ? config.to_emails : [''],
      conditions: config.conditions || {
        subject_pattern: '',
        min_priority: 'normal'
      },
      auto_archive: config.auto_archive,
      auto_reply_enabled: config.auto_reply_enabled,
      auto_reply_template: config.auto_reply_template || '',
      is_active: config.is_active
    });
    setEditingConfig(config);
    setShowForm(true);
  };

  const toggleActive = async (configId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('email_forwarding_config')
        .update({ is_active: isActive })
        .eq('id', configId);

      if (error) throw error;
      await fetchConfigs();
    } catch (error) {
      console.error('Error toggling config status:', error);
    }
  };

  const deleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this forwarding configuration?')) return;

    try {
      const { error } = await supabase
        .from('email_forwarding_config')
        .delete()
        .eq('id', configId);

      if (error) throw error;
      await fetchConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
    }
  };

  const addDomain = () => {
    setFormData({
      ...formData,
      from_domains: [...formData.from_domains, '']
    });
  };

  const removeDomain = (index: number) => {
    setFormData({
      ...formData,
      from_domains: formData.from_domains.filter((_, i) => i !== index)
    });
  };

  const updateDomain = (index: number, value: string) => {
    const newDomains = [...formData.from_domains];
    newDomains[index] = value;
    setFormData({
      ...formData,
      from_domains: newDomains
    });
  };

  const addEmail = () => {
    setFormData({
      ...formData,
      to_emails: [...formData.to_emails, '']
    });
  };

  const removeEmail = (index: number) => {
    setFormData({
      ...formData,
      to_emails: formData.to_emails.filter((_, i) => i !== index)
    });
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...formData.to_emails];
    newEmails[index] = value;
    setFormData({
      ...formData,
      to_emails: newEmails
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Forwarding Configuration</h1>
          <p className="text-gray-600 mt-1">Manage automatic email forwarding and auto-reply rules</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Configuration
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingConfig ? 'Edit Configuration' : 'New Configuration'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Configuration Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Customer Support Forwarding"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Optional description of this forwarding rule"
              />
            </div>

            {/* From Domains */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forward emails FROM these domains
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Leave empty to forward from all domains. Add domain names without @ symbol.
              </p>
              {formData.from_domains.map((domain, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => updateDomain(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., gmail.com"
                  />
                  {formData.from_domains.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDomain(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDomain}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add another domain
              </button>
            </div>

            {/* To Emails */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forward emails TO these addresses *
              </label>
              {formData.to_emails.map((email, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                  {formData.to_emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addEmail}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add another email
              </button>
            </div>

            {/* Conditions */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Conditions</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Pattern (Regex)
                  </label>
                  <input
                    type="text"
                    value={formData.conditions.subject_pattern}
                    onChange={(e) => setFormData({
                      ...formData,
                      conditions: { ...formData.conditions, subject_pattern: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., support|help"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional regex pattern to match in subject</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Priority
                  </label>
                  <select
                    value={formData.conditions.min_priority}
                    onChange={(e) => setFormData({
                      ...formData,
                      conditions: { ...formData.conditions, min_priority: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Auto Actions */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Automatic Actions</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.auto_archive}
                    onChange={(e) => setFormData({ ...formData, auto_archive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Automatically archive forwarded emails
                  </label>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.auto_reply_enabled}
                      onChange={(e) => setFormData({ ...formData, auto_reply_enabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Enable automatic reply
                    </label>
                  </div>

                  {formData.auto_reply_enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Auto-Reply Template
                      </label>
                      <textarea
                        value={formData.auto_reply_template}
                        onChange={(e) => setFormData({ ...formData, auto_reply_template: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={6}
                        placeholder="Dear {{sender_name}},

Thank you for your email. We have received your message and will respond within 24 hours.

Best regards,
Oludeniz Tours Team"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Available variables: {'{{sender_name}}'}, {'{{original_subject}}'}, {'{{received_date}}'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingConfig ? 'Update Configuration' : 'Create Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Configurations List */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading configurations...</div>
        ) : configs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No forwarding configurations yet. Create your first one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {configs.map((config) => (
              <div key={config.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{config.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        config.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {config.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {config.description && (
                      <p className="text-gray-600 mt-1">{config.description}</p>
                    )}

                    <div className="mt-3 space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">From domains:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {config.from_domains.length > 0
                            ? config.from_domains.join(', ')
                            : 'All domains'
                          }
                        </span>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-700">Forward to:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {config.to_emails.join(', ')}
                        </span>
                      </div>

                      {config.conditions?.subject_pattern && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Subject pattern:</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {config.conditions.subject_pattern}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm">
                        {config.auto_archive && (
                          <span className="text-blue-600">✓ Auto-archive</span>
                        )}
                        {config.auto_reply_enabled && (
                          <span className="text-green-600">✓ Auto-reply</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleActive(config.id, !config.is_active)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        config.is_active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {config.is_active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleEdit(config)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteConfig(config.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
