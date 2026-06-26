import React, { useState, useEffect } from 'react';
import { Save, Upload, Loader2, Store, Palette, Globe, Truck, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import { hexToHsl } from '@/lib/format';
import toast from 'react-hot-toast';

export default function SettingsAdmin() {
  const { settings: loadedSettings, refresh } = useSettings();
  const [formData, setFormData] = useState(loadedSettings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  useEffect(() => { setFormData(loadedSettings); }, [loadedSettings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'primary_color') {
      document.documentElement.style.setProperty('--brand-primary', value);
      const hsl = hexToHsl(value);
      if (hsl) document.documentElement.style.setProperty('--primary', hsl);
    }
    if (field === 'secondary_color') document.documentElement.style.setProperty('--brand-secondary', value);
    if (field === 'accent_color') document.documentElement.style.setProperty('--brand-accent', value);
  };

  const handleUpload = async (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange(field, file_url);
      toast.success('Uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(null); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (formData.id) {
        await base44.entities.StoreSettings.update(formData.id, { ...formData, configured: true, maintenance_mode: 'live' });
      } else {
        await base44.entities.StoreSettings.create({ ...formData, configured: true, maintenance_mode: 'live' });
      }
      toast.success('Settings saved');
      refresh();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const sections = [
    { icon: Store, title: 'Store Identity', fields: [
      { key: 'store_name', label: 'Store Name', type: 'text' },
      { key: 'company_name', label: 'Company Name', type: 'text' },
      { key: 'tagline', label: 'Tagline', type: 'text' },
    ]},
    { icon: ImageIcon, title: 'Branding', fields: [
      { key: 'logo_url', label: 'Logo', type: 'image' },
      { key: 'favicon_url', label: 'Favicon', type: 'image' },
      { key: 'primary_color', label: 'Primary Color', type: 'color' },
      { key: 'secondary_color', label: 'Secondary Color', type: 'color' },
      { key: 'accent_color', label: 'Accent Color', type: 'color' },
    ]},
    { icon: Globe, title: 'Hero Section', fields: [
      { key: 'hero_title', label: 'Hero Title', type: 'text' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'hero_image', label: 'Hero Image', type: 'image' },
      { key: 'hero_cta_text', label: 'Hero CTA Text', type: 'text' },
    ]},
    { icon: Palette, title: 'Currency', fields: [
      { key: 'currency_code', label: 'Currency Code', type: 'text' },
      { key: 'currency_symbol', label: 'Currency Symbol', type: 'text' },
      { key: 'currency_position', label: 'Symbol Position', type: 'select', options: [{ value: 'before', label: 'Before ($10)' }, { value: 'after', label: 'After (10$)' }] },
    ]},
    { icon: Globe, title: 'Contact & SEO', fields: [
      { key: 'support_email', label: 'Support Email', type: 'text' },
      { key: 'support_phone', label: 'Support Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'textarea' },
      { key: 'meta_description', label: 'Meta Description', type: 'textarea' },
    ]},
    { icon: Globe, title: 'Social Links', fields: [
      { key: 'instagram_url', label: 'Instagram', type: 'text' },
      { key: 'facebook_url', label: 'Facebook', type: 'text' },
      { key: 'twitter_url', label: 'Twitter/X', type: 'text' },
      { key: 'youtube_url', label: 'YouTube', type: 'text' },
      { key: 'linkedin_url', label: 'LinkedIn', type: 'text' },
    ]},
    { icon: Truck, title: 'Shipping & Tax', fields: [
      { key: 'free_shipping_threshold', label: 'Free Shipping Threshold', type: 'number' },
      { key: 'flat_shipping_fee', label: 'Flat Shipping Fee', type: 'number' },
      { key: 'tax_rate', label: 'Tax Rate (%)', type: 'number' },
    ]},
  ];

  return (
    <div className="max-w-4xl">
      <div className="space-y-6">
        {sections.map((section, si) => (
          <div key={si} className="bg-white border border-border rounded-xl p-5">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <section.icon className="w-5 h-5 text-brand" /> {section.title}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {section.fields.map(field => (
                <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="text-sm font-medium mb-1 block">{field.label}</label>
                  {field.type === 'text' && (
                    <input type="text" value={formData[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" />
                  )}
                  {field.type === 'number' && (
                    <input type="number" step="0.01" value={formData[field.key] || 0} onChange={(e) => handleChange(field.key, Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" />
                  )}
                  {field.type === 'textarea' && (
                    <textarea value={formData[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} rows="2" className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand resize-none" />
                  )}
                  {field.type === 'select' && (
                    <select value={formData[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand bg-white">
                      {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                  {field.type === 'color' && (
                    <div className="flex gap-2 items-center">
                      <input type="color" value={formData[field.key] || '#4F46E5'} onChange={(e) => handleChange(field.key, e.target.value)} className="w-12 h-10 rounded-lg border border-border cursor-pointer" />
                      <input type="text" value={formData[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} className="flex-1 px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" />
                    </div>
                  )}
                  {field.type === 'image' && (
                    <div>
                      {formData[field.key] && (
                        <div className="mb-2">
                          {field.key === 'favicon_url' ? (
                            <img src={formData[field.key]} alt="" className="w-8 h-8 rounded border border-border" />
                          ) : (
                            <img src={formData[field.key]} alt="" className="max-h-20 rounded-lg border border-border" />
                          )}
                        </div>
                      )}
                      <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-brand transition">
                        {uploading === field.key ? <Loader2 className="w-4 h-4 animate-spin text-brand" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
                        <span className="text-sm text-muted-foreground">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(field.key, e)} disabled={uploading === field.key} />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Save bar */}
        <div className="sticky bottom-4 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 shadow-lg">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}