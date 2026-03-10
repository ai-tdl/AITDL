# || ॐ श्री गणेशाय नमः ||
#
# Organization : AITDL — AI Technology Development Lab
# Creator      : Jawahar R. Mallah
# Web          : https://aitdl.com
# Build        : AITDL Platform V3 · Vikram Samvat 2082
# Copyright    : © aitdl.com · AITDL | GANITSUTRAM.com

'use client'
// CMS Dashboard — content overview + quick actions

export default function CMSDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Content Studio</h1>
      <p className="text-gray-400 mb-10">AITDL CMS — Workspace Dashboard</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Pages',   href: '/cms/pages',  count: '—', color: 'from-blue-600 to-blue-900'    },
          { title: 'Blog',    href: '/cms/blog',   count: '—', color: 'from-purple-600 to-purple-900'},
          { title: 'Media',   href: '/cms/media',  count: '—', color: 'from-cyan-600 to-cyan-900'    },
          { title: 'Forms',   href: '/cms/forms',  count: '—', color: 'from-green-600 to-green-900'  },
          { title: 'AI Tools',href: '/cms/ai',     count: '—', color: 'from-orange-600 to-orange-900'},
        ].map(card => (
          <a key={card.href} href={card.href}
            className={`p-6 rounded-xl bg-gradient-to-br ${card.color} border border-white/10
              hover:border-white/30 transition-all hover:scale-105`}>
            <p className="text-3xl font-bold text-white mb-1">{card.count}</p>
            <p className="text-sm text-white/70">{card.title}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
