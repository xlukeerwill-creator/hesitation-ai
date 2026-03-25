import { useState, useEffect } from 'react'
import ProductDetail from './ProductDetail'
import useIsMobile from './useIsMobile'
import Cart from './Cart'

const products = [
  { id: 1, name: 'Organic Face Serum', price: 48, original: 56, category: 'Skincare', rating: 4.8, reviews: 234, img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop', badge: 'Best Seller', desc: 'Brightening & anti-aging' },
  { id: 2, name: 'Vitamin C Moisturizer', price: 36, original: null, category: 'Skincare', rating: 4.6, reviews: 189, img: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop', badge: null, desc: 'Daily hydration boost' },
  { id: 3, name: 'Retinol Night Cream', price: 54, original: 62, category: 'Skincare', rating: 4.9, reviews: 312, img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=400&h=400&fit=crop', badge: 'Top Rated', desc: 'Overnight renewal' },
  { id: 4, name: 'Hydrating Lip Balm Set', price: 22, original: null, category: 'Lip Care', rating: 4.5, reviews: 156, img: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop', badge: null, desc: 'All-day moisture' },
  { id: 5, name: 'SPF 50 Daily Shield', price: 32, original: null, category: 'Sun Care', rating: 4.7, reviews: 278, img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', badge: 'Essential', desc: 'Invisible UV protection' },
  { id: 6, name: 'Gentle Cleanser Gel', price: 28, original: 34, category: 'Skincare', rating: 4.4, reviews: 145, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop', badge: null, desc: 'Sensitive skin formula' },
]

const testimonials = [
  { name: 'Sarah M.', role: 'Skincare Enthusiast', text: 'Nova Skin completely transformed my routine. The serum alone cleared my dark spots in just 3 weeks. I get compliments on my skin every day now.', avatar: 'SM', rating: 5 },
  { name: 'Dr. James K.', role: 'Board-Certified Dermatologist', text: 'I recommend Nova Skin products to my patients. The formulations are clean, effective, and backed by real clinical science. Rare for a DTC brand.', avatar: 'JK', rating: 5 },
  { name: 'Priya R.', role: 'Beauty Editor, Vogue', text: "Finally, a brand that delivers on its promises. The Retinol Night Cream is my holy grail product. I've tried products 3x the price that don't compare.", avatar: 'PR', rating: 5 },
]

const stats = [
  { value: '12K+', label: 'Happy customers' },
  { value: '4.8', label: 'Average rating' },
  { value: '98%', label: 'Would recommend' },
  { value: '14', label: 'Days to results' },
]

export default function Store({ onSwitchView }) {
  const mobile = useIsMobile()
  const [cart, setCart] = useState([])
  const [hovered, setHovered] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [addedId, setAddedId] = useState(null)
  const [trackerCount, setTrackerCount] = useState(23)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    const handleBack = () => {
      if (selectedProduct) {
        setSelectedProduct(null)
      }
    }
    window.addEventListener('popstate', handleBack)
    return () => window.removeEventListener('popstate', handleBack)
  }, [selectedProduct])

  const openProduct = (p) => {
    window.history.pushState({ product: true }, '')
    setSelectedProduct(p)
  }
  const [activeFilter, setActiveFilter] = useState('All')
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100)
    const pt = setTimeout(() => setShowPopup(true), 6000)
    const ci = setInterval(() => setTrackerCount(p => p + (Math.random() > 0.5 ? 1 : 0)), 3000)
    return () => { clearTimeout(pt); clearInterval(ci) }
  }, [])

  const addToCart = (e, p) => { if (e) e.stopPropagation(); setCart([...cart, p]); setAddedId(p.id); setTimeout(() => setAddedId(null), 1200) }
  const addToCartFromDetail = (p, q) => setCart([...cart, ...Array(q).fill(p)])
  const removeFromCart = (id) => {
    const idx = cart.findIndex(c => c.id === id)
    if (idx !== -1) setCart(cart.filter((_, i) => i !== idx))
  }

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    return ms && (activeFilter === 'All' || p.category === activeFilter)
  })

  const searchResults = search.length > 0 ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())) : []

  const px = mobile ? '16px' : '40px'

  const Logo = ({ size = 34 }) => (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <rect width={size} height={size} rx={size * 0.29} fill="url(#lg)"/>
      <defs><linearGradient id="lg" x1="0" y1="0" x2={size} y2={size}><stop stopColor="#0071e3"/><stop offset="1" stopColor="#34c759"/></linearGradient></defs>
      <text x={size/2} y={size*0.67} textAnchor="middle" fill="white" fontSize={size*0.5} fontWeight="700" fontFamily="-apple-system,Helvetica,sans-serif">N</text>
    </svg>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fbfbfd' }}>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(30px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        @keyframes cartPop { 0% { transform:scale(1) } 50% { transform:scale(1.25) } 100% { transform:scale(1) } }
        @keyframes marquee { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
      `}</style>

      {/* ANNOUNCEMENT BAR */}
      <div style={{ background: '#1d1d1f', padding: '8px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 60, whiteSpace: 'nowrap', animation: 'marquee 20s linear infinite' }}>
          {[...Array(2)].map((_, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 60 }}>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>Free shipping on orders $35+</span>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>Dermatologist tested & approved</span>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>100% organic ingredients</span>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>30-day money back guarantee</span>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>Rated 4.8/5 by 12,000+ customers</span>
            </div>
          ))}
        </div>
      </div>

      {/* NAVBAR */}
      <nav style={{
        padding: mobile ? '12px 16px' : '16px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(251,251,253,0.8)', backdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div onClick={() => setSelectedProduct(null)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Logo size={34} />
          {!mobile && <span style={{ color: '#1d1d1f', fontSize: 19, fontWeight: 700, letterSpacing: '0.04em' }}>NOVA SKIN</span>}
        </div>
        <div style={{ display: 'flex', gap: mobile ? 12 : 28, alignItems: 'center' }}>
          {!mobile && ['Shop', 'How It Works', 'Reviews', 'About'].map(item => (
            <span key={item} onClick={() => {
              setSelectedProduct(null)
              setTimeout(() => {
                const map = { 'Shop': 'products-section', 'How It Works': 'howitworks-section', 'Reviews': 'testimonials-section', 'About': 'footer-section' }
                document.getElementById(map[item])?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }} style={{ color: '#6e6e73', fontSize: 14, cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#1d1d1f'}
              onMouseLeave={e => e.target.style.color = '#6e6e73'}>
              {item}
            </span>
          ))}

          <div style={{ position: 'relative' }}>
            <div onClick={() => setSearchOpen(!searchOpen)} style={{
              width: 36, height: 36, borderRadius: 10, background: searchOpen ? '#f5f5f7' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16,
            }}>&#x1F50D;</div>
            {searchOpen && (
              <div style={{
                position: 'absolute', top: 44, right: mobile ? -60 : 0, width: mobile ? 280 : 320,
                background: '#fff', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.12)', padding: 8, zIndex: 200,
              }}>
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                  style={{ width: '100%', padding: '12px 16px', border: 'none', fontSize: 15, outline: 'none', background: '#f5f5f7', borderRadius: 12 }} />
                {searchResults.map(p => (
                  <div key={p.id} onClick={() => { openProduct(p); setSearchOpen(false); setSearch('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginTop: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `url(${p.img}) center/cover`, flexShrink: 0 }} />
                    <div><div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 12, color: '#86868b' }}>${p.price}</div></div>
                  </div>
                ))}
                {search && !searchResults.length && <div style={{ padding: 16, textAlign: 'center', color: '#86868b', fontSize: 14 }}>No results</div>}
              </div>
            )}
          </div>

          <div onClick={() => setCartOpen(true)} style={{ position: 'relative', cursor: 'pointer' }}>
            <span style={{ fontSize: 20, animation: addedId ? 'cartPop 0.4s ease' : 'none' }}>&#x1F6D2;</span>
            {cart.length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -8, background: '#0071e3', color: '#fff', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>
            )}
          </div>
          <button onClick={onSwitchView} style={{
            background: '#0071e3', color: '#fff', border: 'none',
            padding: mobile ? '9px 14px' : '10px 24px', borderRadius: 12,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            {mobile ? 'Dashboard' : 'AI Dashboard \u2192'}
          </button>
        </div>
      </nav>

      {/* AI TRACKER */}
      <div style={{
        background: 'rgba(0,113,227,0.04)', borderBottom: '1px solid rgba(0,113,227,0.08)',
        padding: mobile ? '8px 16px' : '9px 48px',
        display: 'flex', alignItems: 'center', gap: 8, fontSize: mobile ? 11 : 13,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0071e3', animation: 'pulse 2s infinite', flexShrink: 0 }} />
        <span style={{ fontWeight: 600, color: '#0071e3' }}>AI Tracker</span>
        <span style={{ color: '#86868b' }}>&#183; 847 visitors &#183; {trackerCount} signals</span>
        {!mobile && <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759' }} />
          <span style={{ fontSize: 12, color: '#34c759', fontWeight: 500 }}>Healthy</span>
        </div>}
      </div>

      {selectedProduct ? (
        <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={addToCartFromDetail} mobile={mobile} />
      ) : (
        <>
          {/* HERO */}
          <div style={{ padding: mobile ? '60px 20px 50px' : '100px 48px 60px', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.25,1,0.5,1)' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 20px', borderRadius: 980, background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)', marginBottom: 28,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759' }} />
                <span style={{ fontSize: 13, color: '#1d1d1f', fontWeight: 600 }}>New: Spring Collection 2026</span>
              </div>

              <h1 style={{
                fontSize: mobile ? 40 : 72, fontWeight: 700, lineHeight: 1.04,
                letterSpacing: '-0.035em', color: '#1d1d1f', marginBottom: 20,
              }}>
                Your skin deserves<br />
                <span style={{ background: 'linear-gradient(135deg, #0071e3 0%, #34c759 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>better science.</span>
              </h1>

              <p style={{ fontSize: mobile ? 17 : 22, color: '#6e6e73', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.45 }}>
                Clinically-proven formulas that deliver visible results in 14 days. No compromises, no filler ingredients.
              </p>

              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
                <button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })} style={{
                  background: '#0071e3', color: '#fff', border: 'none',
                  padding: '17px 40px', borderRadius: 14, fontSize: 17, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,113,227,0.2)', transition: 'all 0.3s',
                }}
                  onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
                  Shop Best Sellers
                </button>
                <button onClick={() => document.getElementById('howitworks-section')?.scrollIntoView({ behavior: 'smooth' })} style={{
                  background: '#fff', color: '#1d1d1f', border: '1.5px solid rgba(0,0,0,0.12)',
                  padding: '17px 40px', borderRadius: 14, fontSize: 17, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.target.style.borderColor = '#0071e3'; e.target.style.color = '#0071e3' }}
                  onMouseLeave={e => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.color = '#1d1d1f' }}>
                  How It Works &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)', padding: mobile ? '28px 16px' : '36px 48px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: mobile ? 20 : 0, textAlign: 'center' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ borderRight: !mobile && i < 3 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                  <div style={{ fontSize: mobile ? 28 : 36, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#86868b', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCTS */}
          <div id="products-section" style={{ padding: mobile ? '48px 16px 60px' : '72px 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: mobile ? 'flex-start' : 'flex-end', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 16 : 0, marginBottom: mobile ? 28 : 44 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0071e3', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Our collection</p>
                <h2 style={{ fontSize: mobile ? 28 : 40, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 0 }}>Best Sellers</h2>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['All', 'Skincare', 'Sun Care', 'Lip Care'].map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)} style={{
                    padding: '9px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: activeFilter === f ? '#1d1d1f' : '#fff', color: activeFilter === f ? '#fff' : '#6e6e73',
                    boxShadow: activeFilter === f ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                  }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: mobile ? 16 : 24 }}>
              {filtered.map((p, i) => (
                <div key={p.id} onClick={() => openProduct(p)}
                  onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)}
                  style={{
                    background: '#fff', borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.25,1,0.5,1)',
                    transform: !mobile && hovered === p.id ? 'translateY(-8px)' : 'none',
                    boxShadow: !mobile && hovered === p.id ? '0 20px 60px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    opacity: loaded ? 1 : 0, animation: loaded ? `fadeInUp 0.5s ease ${i * 0.08}s both` : 'none',
                  }}>
                  <div style={{ height: mobile ? 220 : 260, position: 'relative', overflow: 'hidden', background: '#f5f5f7' }}>
                    <div style={{ width: '100%', height: '100%', background: `url(${p.img}) center/cover`, transition: 'transform 0.6s ease', transform: !mobile && hovered === p.id ? 'scale(1.06)' : 'scale(1)' }} />
                    {p.badge && (
                      <span style={{
                        position: 'absolute', top: 14, left: 14, fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 10,
                        background: p.badge === 'Best Seller' ? '#0071e3' : p.badge === 'Top Rated' ? '#1d1d1f' : '#34c759', color: '#fff',
                      }}>{p.badge}</span>
                    )}
                    {!mobile && hovered === p.id && (
                      <div style={{
                        position: 'absolute', bottom: 14, right: 14, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                        borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: '#0071e3',
                      }}>Quick View &rarr;</div>
                    )}
                  </div>
                  <div style={{ padding: '20px 22px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#ff9500' }}>{'\u2605'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.rating}</span>
                      <span style={{ fontSize: 12, color: '#86868b', marginLeft: 2 }}>({p.reviews})</span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.3 }}>{p.name}</h3>
                    <p style={{ fontSize: 13, color: '#86868b', margin: '0 0 14px' }}>{p.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 22, fontWeight: 700 }}>${p.price}</span>
                        {p.original && <span style={{ fontSize: 14, color: '#86868b', textDecoration: 'line-through' }}>${p.original}</span>}
                      </div>
                      <button onClick={(e) => addToCart(e, p)} style={{
                        padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                        background: addedId === p.id ? '#34c759' : '#0071e3', color: '#fff',
                      }}>{addedId === p.id ? '\u2713' : 'Add'}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div id="howitworks-section" style={{ background: '#1d1d1f', padding: mobile ? '60px 16px' : '100px 48px', color: '#fff' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: mobile ? 40 : 60 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0071e3', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Why Nova Skin</p>
                <h2 style={{ fontSize: mobile ? 28 : 44, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>Science meets simplicity</h2>
                <p style={{ fontSize: mobile ? 16 : 19, color: '#86868b', maxWidth: 560, margin: '0 auto' }}>
                  Every product is developed with dermatologists, tested in clinical trials, and made with ingredients you can actually pronounce.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
                {[
                  { icon: '\uD83D\uDD2C', title: 'Clinical Results', text: '92% of users saw visible improvement in skin texture within 14 days of consistent use.' },
                  { icon: '\uD83C\uDF31', title: 'Clean Ingredients', text: 'No parabens, sulfates, or synthetic fragrances. Every ingredient is sourced responsibly and transparently.' },
                  { icon: '\u267B\uFE0F', title: 'Sustainable', text: 'Carbon-neutral shipping, recyclable packaging, and refill programs that reduce waste by 60%.' },
                ].map((f, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: mobile ? 24 : 32, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: 28, display: 'block', marginBottom: 16 }}>{f.icon}</span>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                    <p style={{ fontSize: 14, color: '#a1a1a6', lineHeight: 1.6, margin: 0 }}>{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TESTIMONIALS */}
          <div id="testimonials-section" style={{ background: '#fbfbfd', padding: mobile ? '60px 16px' : '100px 48px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: mobile ? 36 : 56 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0071e3', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Testimonials</p>
                <h2 style={{ fontSize: mobile ? 28 : 44, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Loved by thousands</h2>
                <p style={{ fontSize: 17, color: '#86868b' }}>Real stories from dermatologists, editors, and everyday customers</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
                {testimonials.map((t, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 20, padding: mobile ? 24 : 32, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 14, color: '#ff9500', marginBottom: 16 }}>{'\u2605'.repeat(t.rating)}</div>
                    <p style={{ fontSize: 16, color: '#1d1d1f', lineHeight: 1.6, margin: '0 0 24px', fontWeight: 500, flex: 1 }}>"{t.text}"</p>
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#6e6e73' }}>{t.avatar}</div>
                      <div><div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: 12, color: '#86868b' }}>{t.role}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg, #0071e3 0%, #34c759 100%)', padding: mobile ? '48px 20px' : '72px 48px', textAlign: 'center' }}>
            <h2 style={{ fontSize: mobile ? 28 : 40, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 12 }}>Ready to transform your skin?</h2>
            <p style={{ fontSize: mobile ? 16 : 19, color: 'rgba(255,255,255,0.8)', maxWidth: 480, margin: '0 auto 32px' }}>
              Join 12,000+ customers who made the switch to science-backed skincare.
            </p>
            <button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })} style={{
              background: '#fff', color: '#0071e3', border: 'none',
              padding: '17px 44px', borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>Shop Now &#8212; 15% Off First Order</button>
          </div>

          {/* FOOTER */}
          <footer id="footer-section" style={{ background: '#1d1d1f', padding: mobile ? '40px 16px 28px' : '60px 48px 36px', color: '#fff' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 32 : 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Logo size={28} />
                  <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.04em' }}>NOVA SKIN</span>
                </div>
                <p style={{ fontSize: 13, color: '#86868b', maxWidth: 240, lineHeight: 1.5 }}>Clean, effective skincare backed by science. Made for real people.</p>
              </div>
              <div style={{ display: 'flex', gap: mobile ? 32 : 56, flexWrap: 'wrap' }}>
                {[
                  { title: 'Shop', links: ['Best Sellers', 'New Arrivals', 'Skincare', 'Bundles'] },
                  { title: 'Company', links: ['About Us', 'Science', 'Careers', 'Press'] },
                  { title: 'Support', links: ['FAQ', 'Shipping', 'Returns', 'Contact'] },
                ].map((col, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{col.title}</div>
                    {col.links.map(l => (
                      <div key={l} style={{ fontSize: 13, color: '#86868b', marginBottom: 10, cursor: 'pointer' }}
                        onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#86868b'}>{l}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ maxWidth: 1100, margin: '36px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', flexDirection: mobile ? 'column' : 'row', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#52525b' }}>&copy; 2026 Nova Skin. All rights reserved.</span>
              <span style={{ fontSize: 12, color: '#52525b' }}>Privacy &#183; Terms &#183; Cookies</span>
            </div>
          </footer>
        </>
      )}

      {/* AI POPUP */}
      {showPopup && !selectedProduct && (
        <div style={{
          position: 'fixed', bottom: mobile ? 16 : 28, right: mobile ? 16 : 28,
          left: mobile ? 16 : 'auto', width: mobile ? 'auto' : 380,
          background: '#fff', borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.15)', padding: mobile ? 22 : 28,
          zIndex: 200, animation: 'slideUp 0.5s cubic-bezier(0.25,1,0.5,1)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0071e3', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 8, background: 'rgba(0,113,227,0.06)', color: '#0071e3' }}>AI Intervention</span>
            </div>
            <span onClick={() => setShowPopup(false)} style={{ cursor: 'pointer', fontSize: 18, color: '#86868b', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => e.target.style.background = '#f5f5f7'} onMouseLeave={e => e.target.style.background = 'transparent'}>{'\u2715'}</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Still deciding?</p>
          <p style={{ fontSize: 15, color: '#6e6e73', margin: '0 0 20px', lineHeight: 1.55 }}>
            We noticed you are browsing. Here is <strong style={{ color: '#1d1d1f' }}>15% off</strong> your first order.
          </p>
          <div style={{ background: '#f5f5f7', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.12em' }}>WELCOME15</span>
          </div>
          <button style={{
            width: '100%', padding: 15, background: '#0071e3', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,113,227,0.2)',
          }}>Apply & Shop Now</button>
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: '#f5f5f7', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#86868b' }}>Blocker: <strong style={{ color: '#1d1d1f' }}>Price Sensitivity</strong></span>
            <span style={{ fontSize: 11, color: '#86868b' }}>Confidence: <strong style={{ color: '#1d1d1f' }}>87%</strong></span>
          </div>
        </div>
      )}

      {/* CART */}
      {cartOpen && <Cart items={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} mobile={mobile} />}
    </div>
  )
}