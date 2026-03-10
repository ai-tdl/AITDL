"use client"

export default function ExploreCTA({ dict }: { dict: any }) {
  return (
    <section className="mt-32 glass p-12 md:p-20 text-center relative overflow-hidden rv">
      <div className="relative z-10">
        <h2 className="font-heading text-4xl md:text-6xl text-white mb-6">{dict.head}</h2>
        <p className="text-[#6a6860] text-sm mb-10 max-w-xl mx-auto">
          {dict.sub}
        </p>
        <button
          onClick={() => (window as any).dispatchRolePicker?.()}
          className="bg-[#c9a84c] text-black font-heading px-10 py-4 text-xl tracking-[0.1em] hover:scale-105 transition-transform"
        >
          {dict.btn} →
        </button>
      </div>
      <div className="orb w-[400px] h-[400px] bg-[#c9a84c]/10 bottom-[-200px] right-[-100px]" />
    </section>
  )
}
