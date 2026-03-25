import { useState } from 'react'

const productImages = {
  1: [
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&h=600&fit=crop',
  ],
  2: [
    'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop',
  ],
  3: [
    'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=600&fit=crop',
  ],
  4: [
    'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&h=600&fit=crop',
  ],
  5: [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop',
  ],
  6: [
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&h=600&fit=crop',
  ],
}

const reviews = [
  { name: 'Sarah M.', location: 'New York, NY', rating: 5, text: 'This serum changed my skin completely. After 3 weeks, my dark spots faded and my skin feels incredibly smooth.', date: '2 weeks ago', verified: true, avatar: 'SM' },
  { name: 'Jessica L.', location: 'Los Angeles, CA', rating: 5, text: "I've tried dozens of serums and this is by far the best. Lightweight, absorbs quickly, and the results speak for themselves.", date: '1 month ago', verified: true, avatar: 'JL' },
  { name: 'Emily R.', location: 'Chicago, IL', rating: 4, text: 'Great product overall. Takes a bit longer than expected to see results but my skin texture has definitely improved.', date: '3 weeks ago', verified: true, avatar: 'ER' },
  { name: 'Maria G.', location: 'Miami, FL', rating: 5, text: "My dermatologist recommended this and I'm so glad she did. My skin has never looked this healthy.", date: '1 week ago', verified: true, avatar: 'MG' },
]

export default function ProductDetail({ product, onBack, onAddToCart, mobile }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedTab, setSelectedTab] = useState('details')
  const images = productImages[product.id] || [product.img]
  const [activeImg, setActiveImg] = useState(0)

  const handleAdd = () => {
    onAddToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const stars = (n) => '\u2605'.repeat(Math.floor(n))
  const px = mobile ? '16px' : '40px'

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>

      <div style={{ padding: `20px ${px}`, maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#86868b' }}>
          <span onClick={onBack} style={{ cursor: 'pointer', color: '#0071e3' }}>Shop</span>
          <span>&rsaquo;</span>
          <span>{product.category}</span>
          <span>&rsaquo;</span>
          <span style={{ color: '#1d1d1f' }}>{product.name}</span>
        </div>
      </div>

      <div style={{ padding: `0 ${px} 60px`, maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 24 : 60, alignItems: 'start' }}>
          <div>
            <div style={{ borderRadius: 20, overflow: 'hidden', background: '#f5f5f7', aspectRatio: '1', position: 'relative' }}>
              <div style={{ width: '100%', height: '100%', background: `url(${images[activeImg]}) center/cover`, transition: 'background 0.3s ease' }} />
              {product.badge && (
                <span style={{
                  position: 'absolute', top: 20, left: 20, fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 10,
                  background: product.badge === 'Best Seller' ? '#0071e3' : product.badge === 'Top Rated' ? '#1d1d1f' : '#34c759',
                  color: '#fff',
                }}>{product.badge}</span>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                {images.map((src, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{
                    width: 72, height: 72, borderRadius: 12, background: '#f5f5f7',
                    border: activeImg === i ? '2px solid #0071e3' : '1px solid rgba(0,0,0,0.06)',
                    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ width: '100%', height: '100%', background: `url(${src}) center/cover`, opacity: activeImg === i ? 1 : 0.5, transition: 'opacity 0.2s' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: '#ff9500' }}>{stars(product.rating)}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{product.rating}</span>
              <span style={{ fontSize: 13, color: '#86868b' }}>({product.reviews} reviews)</span>
            </div>
            <h1 style={{ fontSize: mobile ? 28 : 36, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{product.name}</h1>
            <p style={{ fontSize: 15, color: '#6e6e73', margin: '0 0 24px', lineHeight: 1.6 }}>
              A lightweight, fast-absorbing formula packed with powerful antioxidants and natural botanicals. Clinically proven to improve skin texture in as little as 14 days.
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 36, fontWeight: 700 }}>${product.price}</span>
              {product.original && (
                <span style={{ fontSize: 18, color: '#86868b', textDecoration: 'line-through' }}>${product.original}</span>
              )}
              {product.original && (
                <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 980, background: 'rgba(255,59,48,0.08)', color: '#ff3b30' }}>Save ${product.original - product.price}</span>
              )}
            </div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: '#86868b', fontWeight: 500, display: 'block', marginBottom: 8 }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', width: 'fit-content', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, overflow: 'hidden' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 44, height: 44, border: 'none', background: '#f5f5f7', fontSize: 18, cursor: 'pointer' }}>-</button>
                <span style={{ width: 50, textAlign: 'center', fontSize: 16, fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ width: 44, height: 44, border: 'none', background: '#f5f5f7', fontSize: 18, cursor: 'pointer' }}>+</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              <button onClick={handleAdd} style={{
                flex: 1, padding: 16, borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 600, cursor: 'pointer',
                background: added ? '#34c759' : '#0071e3', color: '#fff',
                boxShadow: '0 4px 12px rgba(0,113,227,0.2)', transition: 'all 0.3s',
              }}>{added ? '\u2713 Added to Cart' : 'Add to Cart'}</button>
              <button style={{ padding: '16px 24px', borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.1)', background: '#fff', cursor: 'pointer', fontSize: 16 }}>{'\u2661'}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 10 }}>
              {[
                { icon: '\uD83D\uDE9A', label: 'Free shipping over $35' },
                { icon: '\u21A9\uFE0F', label: '30-day money back' },
                { icon: '\uD83E\uDDEA', label: 'Dermatologist tested' },
                { icon: '\uD83C\uDF3F', label: '100% organic ingredients' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f5f5f7', borderRadius: 12 }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: '#6e6e73', fontWeight: 500 }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: `0 ${px}` }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(0,0,0,0.06)', overflowX: 'auto' }}>
            {['details', 'ingredients', 'reviews'].map(t => (
              <button key={t} onClick={() => setSelectedTab(t)} style={{
                padding: mobile ? '14px 16px' : '16px 24px', border: 'none', background: 'none',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', whiteSpace: 'nowrap',
                color: selectedTab === t ? '#0071e3' : '#86868b',
                borderBottom: selectedTab === t ? '2px solid #0071e3' : '2px solid transparent',
              }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: `32px ${px} 80px` }}>
          {selectedTab === 'details' && (
            <div style={{ maxWidth: 640 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Product details</h3>
              <p style={{ fontSize: 15, color: '#6e6e73', lineHeight: 1.7, marginBottom: 20 }}>
                Our {product.name} is formulated with a unique blend of active ingredients that work synergistically to improve skin health. Each batch is third-party tested for purity and potency.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                {[{ label: 'Skin Type', value: 'All skin types' }, { label: 'Size', value: '30ml / 1.0 fl oz' }, { label: 'Usage', value: 'Morning & evening' }, { label: 'Results In', value: '14-28 days' }].map((d, i) => (
                  <div key={i} style={{ padding: '14px 16px', background: '#f5f5f7', borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: '#86868b', marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedTab === 'ingredients' && (
            <div style={{ maxWidth: 640 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Key ingredients</h3>
              {[{ name: 'Hyaluronic Acid', pct: '2%', desc: 'Deep hydration, plumps skin' }, { name: 'Niacinamide', pct: '5%', desc: 'Reduces pores, evens tone' }, { name: 'Vitamin E', pct: '1%', desc: 'Antioxidant, repairs barrier' }, { name: 'Green Tea Extract', pct: '3%', desc: 'Anti-inflammatory' }].map((ing, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{ing.name}</div>
                    <div style={{ fontSize: 13, color: '#86868b' }}>{ing.desc}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, padding: '4px 12px', background: '#f5f5f7', borderRadius: 980, flexShrink: 0 }}>{ing.pct}</span>
                </div>
              ))}
            </div>
          )}
          {selectedTab === 'reviews' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexDirection: mobile ? 'column' : 'row', gap: mobile ? 16 : 0 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Customer reviews</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, color: '#ff9500' }}>{stars(product.rating)}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{product.rating} out of 5</span>
                    <span style={{ fontSize: 13, color: '#86868b' }}>{product.reviews} reviews</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[{ s: 5, p: 72 }, { s: 4, p: 18 }, { s: 3, p: 6 }, { s: 2, p: 3 }, { s: 1, p: 1 }].map(r => (
                    <div key={r.s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#86868b', width: 12, textAlign: 'right' }}>{r.s}</span>
                      <span style={{ fontSize: 11, color: '#ff9500' }}>{'\u2605'}</span>
                      <div style={{ width: 120, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${r.p}%`, background: '#ff9500', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#86868b', width: 30 }}>{r.p}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {reviews.map((r, i) => (
                <div key={i} style={{ padding: '20px 24px', background: '#fafafa', borderRadius: 16, border: '1px solid rgba(0,0,0,0.04)', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: '#e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#6e6e73' }}>{r.avatar}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: '#86868b' }}>{r.location}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, color: '#ff9500' }}>{'\u2605'.repeat(r.rating)}</div>
                      <div style={{ fontSize: 11, color: '#86868b' }}>{r.date}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.6, margin: 0 }}>{r.text}</p>
                  {r.verified && (
                    <div style={{ marginTop: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 980, background: 'rgba(52,199,89,0.08)', color: '#34c759' }}>{'\u2713'} Verified Purchase</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}