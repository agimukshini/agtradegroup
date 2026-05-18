'use client';

import { useState } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Contact' }]} />

      <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-bold mb-6">Get in Touch</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-brand-orange flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-gray-600">+383 44 123 456</p>
                <p className="text-sm text-gray-400">Mon-Sat: 8:00 - 18:00</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-brand-orange flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">info@agtradegroup.com</p>
                <p className="text-sm text-gray-400">We respond within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-brand-orange flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-gray-600">Rruga UÇK Nr. 15, Ferizaj 70000, Kosovo</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">WhatsApp</h3>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                  Chat with us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Send a Message</h2>
          {sent ? (
            <div className="text-center py-8">
              <div className="text-success text-4xl mb-4">✓</div>
              <h3 className="font-bold text-lg mb-2">Message Sent!</h3>
              <p className="text-gray-500">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message *</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4} required className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy" />
              </div>
              <button type="submit" className="w-full bg-brand-orange text-white py-3 rounded-lg font-semibold hover:bg-brand-orange-hover transition-colors">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

