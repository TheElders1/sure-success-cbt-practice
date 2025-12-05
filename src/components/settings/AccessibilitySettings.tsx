import { useState, useEffect } from 'react';
import { Eye, Type, Contrast, Zap, Keyboard } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface AccessibilitySettings {
  accessibility_mode: boolean;
  font_size: 'small' | 'medium' | 'large' | 'extra-large';
  high_contrast: boolean;
  reduce_motion: boolean;
  keyboard_shortcuts_enabled: boolean;
}

export default function AccessibilitySettings() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    accessibility_mode: false,
    font_size: 'medium',
    high_contrast: false,
    reduce_motion: false,
    keyboard_shortcuts_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  useEffect(() => {
    applySettings();
  }, [settings]);

  async function loadSettings() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      } else {
        await supabase.from('user_settings').insert({
          user_id: user.id,
          ...settings,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  }

  function applySettings() {
    const root = document.documentElement;

    root.classList.toggle('high-contrast', settings.high_contrast);
    root.classList.toggle('reduce-motion', settings.reduce_motion);

    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px',
    };
    root.style.fontSize = fontSizeMap[settings.font_size];
  }

  function updateSetting<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-full">
            <Eye className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Accessibility Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize your experience for better usability
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="text-gray-600 dark:text-gray-400" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Accessibility Mode
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enhanced features for better accessibility
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.accessibility_mode}
                onChange={(e) => updateSetting('accessibility_mode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 dark:peer-focus:ring-brand-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Type className="text-gray-600 dark:text-gray-400" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Font Size
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Adjust text size for better readability
                </p>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('font_size', size)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                        settings.font_size === size
                          ? 'bg-brand-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {size === 'extra-large' ? 'XL' : size.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Contrast className="text-gray-600 dark:text-gray-400" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  High Contrast
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Increase contrast for better visibility
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.high_contrast}
                onChange={(e) => updateSetting('high_contrast', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 dark:peer-focus:ring-brand-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="text-gray-600 dark:text-gray-400" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Reduce Motion
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Minimize animations and transitions
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reduce_motion}
                onChange={(e) => updateSetting('reduce_motion', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 dark:peer-focus:ring-brand-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Keyboard className="text-gray-600 dark:text-gray-400" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable keyboard navigation and shortcuts
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.keyboard_shortcuts_enabled}
                onChange={(e) => updateSetting('keyboard_shortcuts_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 dark:peer-focus:ring-brand-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="primary"
            onClick={saveSettings}
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>

      {settings.keyboard_shortcuts_enabled && (
        <Card variant="elevated" padding="md">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Next Question</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono">
                →
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Previous Question</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono">
                ←
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Select Option A</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono">
                1
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Select Option B</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono">
                2
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Submit Answer</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono">
                Enter
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Pause Quiz</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono">
                Esc
              </kbd>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
