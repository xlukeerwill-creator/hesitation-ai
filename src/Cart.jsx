import { useState } from 'react'

export default function Cart({ items, onClose, onRemove, mobile }) {
  const [step, setStep] = useState('cart')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const unique = items.reduce((acc, item) => {
    const found = acc.find(i => i.id === item.id)
    if (found) found.qty += 1
    else acc.push({ ...item, qty: 1 })
    return acc
  }, [])

  const subtotal = items.reduce((sum, i) => sum + i.price, 0)
  const shipping = subtotal >= 35 ? 0 : 5.99
  const total = subtotal + shipping

  if (step === 'success') return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: mobile ? 28 : 40, maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,199,89,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Order confirmed!</h2>
        <p style={{ fontSize: 15, color: '#6e6e73', lineHeight: 1.5, marginBottom: 24 }}>Thank you for your order. You'll receive a confirmation email shortly.</p>
        <p style={{ fontSize: 13, color: '#86868b', marginBottom: 24 }}>This is a demo — no real charges were made.</p>
        <button onClick={onClose} style={{ background: '#0071e3', color: '#fff', border: 'none', padding: '14px 36px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>Continue Shopping</button>
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        width: mobile ? '100%' : 440, background: '#fff', height: '100%',
        display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform:translateX(100%) } to { transform:translateX(0) } }`}</style>

        {/* HEADER */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{step === 'cart' ? `Cart (${items.length})` : 'Checkout'}</h2>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 18, color: '#86868b', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.target.style.background = '#f5f5f7'}
            onMouseLeave={e => e.target.style.background = 'transparent'}>✕</span>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {step === 'cart' && (
            <>
              {unique.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🛒</div>
                  <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Your cart is empty</p>
                  <p style={{ fontSize: 14, color: '#86868b' }}>Add some products to get started</p>
                </div>
              ) : (
                unique.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 12, background: `url(${item.img}) center/cover`, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: '#86868b', marginBottom: 8 }}>Qty: {item.qty}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>${(item.price * item.qty).toFixed(2)}</span>
                        <span onClick={() => onRemove(item.id)} style={{ fontSize: 12, color: '#ff3b30', cursor: 'pointer', fontWeight: 600 }}>Remove</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {step === 'checkout' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#86868b', fontWeight: 500, display: 'block', marginBottom: 6 }}>Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"
                  style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 15, outline: 'none', background: '#fbfbfd' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#86868b', fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" type="email"
                  style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 15, outline: 'none', background: '#fbfbfd' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#86868b', fontWeight: 500, display: 'block', marginBottom: 6 }}>Card number</label>
                <input placeholder="4242 4242 4242 4242" style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 15, outline: 'none', background: '#fbfbfd' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#86868b', fontWeight: 500, display: 'block', marginBottom: 6 }}>Expiry</label>
                  <input placeholder="MM/YY" style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 15, outline: 'none', background: '#fbfbfd' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#86868b', fontWeight: 500, display: 'block', marginBottom: 6 }}>CVC</label>
                  <input placeholder="123" style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 15, outline: 'none', background: '#fbfbfd' }} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: '#86868b', fontWeight: 500, display: 'block', marginBottom: 6 }}>Shipping address</label>
                <input placeholder="123 Main St, New York, NY" style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 15, outline: 'none', background: '#fbfbfd' }} />
              </div>
              <div style={{ padding: '14px 16px', background: '#f5f5f7', borderRadius: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#86868b' }}>Discount code applied</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#34c759' }}>WELCOME15 (-15%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {unique.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#6e6e73' }}>
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: '#6e6e73' }}>
              <span>Shipping</span><span style={{ color: shipping === 0 ? '#34c759' : '#6e6e73' }}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            {step === 'cart' ? (
              <button onClick={() => setStep('checkout')} style={{
                width: '100%', padding: 16, background: '#0071e3', color: '#fff',
                border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,113,227,0.2)',
              }}>Proceed to Checkout</button>
            ) : (
              <button onClick={() => setStep('success')} style={{
                width: '100%', padding: 16, background: '#34c759', color: '#fff',
                border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(52,199,89,0.2)',
              }}>Place Order — ${total.toFixed(2)}</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}