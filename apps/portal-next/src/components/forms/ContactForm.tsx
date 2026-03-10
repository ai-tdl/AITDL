// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Client Component: Contact Form with Intelligent Location Selector

"use client";

import { useState } from "react";
import LocationSelector from "./LocationSelector";

const SECTIONS = [
  { value: 'general',      label: 'General Enquiry' },
  { value: 'ganitsutram',  label: 'GanitSūtram' },
  { value: 'dailyboard',   label: 'Dailyboard' },
  { value: 'retail',       label: 'Retail POS / Shoper' },
  { value: 'erp',          label: 'ERP / TallyPrime' },
  { value: 'education',    label: 'School / Coaching ERP' },
  { value: 'partner',      label: 'Partnership' },
];

export default function ContactForm() {
  const [location, setLocation] = useState({ state: "", city: "" });

  return (
    <form
      action="/api/contact"
      method="POST"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-widest">Full Name *</label>
          <input name="name" required placeholder="Rahul Sharma" className="form-input" />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-widest">Phone *</label>
          <input name="phone" required placeholder="9876543210" className="form-input" />
        </div>
      </div>
      
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-widest">Email</label>
        <input name="email" type="email" placeholder="rahul@example.com" className="form-input" />
      </div>

      {/* Intelligent Location Selector */}
      <LocationSelector 
        theme="violet"
        onLocationChange={(state, city) => setLocation({ state, city })}
      />
      
      {/* Hidden inputs for form submission if using traditional POST */}
      <input type="hidden" name="state" value={location.state} />
      <input type="hidden" name="city" value={location.city} />

      <div>
        <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-widest">Subject *</label>
        <select name="section" required className="form-input">
          <option value="">Select topic</option>
          {SECTIONS.map(s => (
            <option key={s.value} value={s.value} className="bg-zinc-900">{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-widest">Message *</label>
        <textarea
          name="message"
          required
          rows={5}
          minLength={20}
          placeholder="Tell us what you need — product demo, pricing, technical question..."
          className="form-input resize-none"
        />
      </div>

      <button
        type="submit"
        className="btn-premium btn-premium-violet w-full"
      >
        Send Message <span className="ml-2">→</span>
      </button>

      <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-mono">
        "See it. Love it. Then pay for it."
      </p>
    </form>
  );
}
