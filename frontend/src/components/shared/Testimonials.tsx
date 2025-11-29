const testimonials = [
  {
    quote:
      'Each piece feels personally handpicked. My living room transformation started here.',
    name: 'Elena Morrison',
    role: 'Interior stylist'
  },
  {
    quote:
      'Hezak Boutique embodies elegance. The craftsmanship and detail are unmatched.',
    name: 'Samuel Hart',
    role: 'Creative director'
  },
  {
    quote: 'From browsing to delivery, every step felt luxurious and thoughtful.',
    name: 'Priya Desai',
    role: 'Luxury consultant'
  }
];

const Testimonials = () => {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {testimonials.map((item) => (
        <div key={item.name} className="glass-panel h-full p-8">
          <p className="text-lg italic text-slate-200">&ldquo;{item.quote}&rdquo;</p>
          <div className="mt-6">
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-sm text-slate-400">{item.role}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Testimonials;


