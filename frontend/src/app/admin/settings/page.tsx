'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {saved && (
        <div className="bg-success/10 text-success p-4 rounded-lg mb-6">Settings saved successfully!</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">Store Settings</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input type="text" defaultValue="AG Trade Group" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" defaultValue="+383 44 123 456" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" defaultValue="info@agtradegroup.com" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input type="text" defaultValue="Rruga UÇK Nr. 15, Ferizaj" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <button type="submit" className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-hover transition-colors">
              Save Settings
            </button>
          </form>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">Shipping Settings</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Free Delivery City</label>
              <input type="text" defaultValue="Ferizaj" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Standard Delivery Fee (EUR)</label>
              <input type="number" step="0.01" defaultValue="2.00" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Free Shipping Threshold (EUR)</label>
              <input type="number" step="0.01" defaultValue="100" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <button type="submit" className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-hover transition-colors">
              Save Shipping
            </button>
          </form>
        </div>

        {/* Low Stock Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">Inventory Alerts</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Default Low Stock Threshold</label>
              <input type="number" defaultValue="10" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <p className="text-sm text-gray-500">Products with stock below this threshold will trigger low stock alerts in the dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
