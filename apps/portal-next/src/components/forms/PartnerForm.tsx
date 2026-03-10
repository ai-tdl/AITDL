// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Client Component: Partner Registration Form with Intelligent Location Selector

"use client";

import { useState } from "react";
import LocationSelector from "./LocationSelector";

const OCCUPATIONS = [
  'IT Reseller / VAR',
  'Tally Partner',
  'School / Coaching Owner',
  'Retail Chain Owner',
  'Freelance Consultant',
  'System Integrator',
  'Other',
];

export default function PartnerForm() {
  const [location, setLocation] = useState({ state: "", city: "" });

  return (
    <form
      action="/api/partner"
      method="POST"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-widest">Full Name *</label>
          <input name="name" required placeholder="Your full name" className="form-input" />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-widest">Phone *</label>
          <input name="phone" required placeholder="10-digit mobile" className="form-input" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-widest">Email *</label>
        <input name="email" type="email" required placeholder="you@company.com" className="form-input" />
      </div>

      {/* Intelligent Location Selector */}
      <LocationSelector 
        theme="emerald"
        onLocationChange={(state, city) => setLocation({ state, city })}
      />
      
      {/* Hidden inputs for form submission */}
      <input type="hidden" name="state" value={location.state} />
      <input type="hidden" name="city" value={location.city} />

      <div>
        <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-widest">Current Occupation *</label>
        <select name="occupation" required className="form-input">
          <option value="">Select occupation</option>
          {OCCUPATIONS.map(o => (
            <option key={o} value={o} className="bg-zinc-900">{o}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-widest">Why do you want to partner with AITDL?</label>
        <textarea
          name="message"
          rows={4}
          placeholder="Tell us about your existing business, your market, and what you hope to achieve..."
          className="form-input resize-none"
        />
      </div>

      <button
        type="submit"
        className="btn-premium btn-premium-emerald w-full"
      >
        Submit Application <span className="ml-2">→</span>
      </button>

      <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-mono">
        "See it. Love it. Then pay for it."
      </p>
    </form>
  );
}
