'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Truck, Library, Loader2 } from 'lucide-react';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  courseTitle = 'Wisdom Eye', 
  courseSlug = 'wisdom-eye', 
  courseUrl = 'https://coursesradheshyamdas.ongraphy.com/courses/Wisdom-Eye-689c419d8fb8275d3690dac1',
  basePrice = 200
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    deliveryType: 'pickup', // 'pickup' or 'delivery'
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // Basic Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      setErrorMsg('Please fill in all standard contact fields.');
      setLoading(false);
      return;
    }

    if (formData.deliveryType === 'delivery') {
      if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
        setErrorMsg('Please fill in all shipping address fields for home delivery.');
        setLoading(false);
        return;
      }
    }

    // Load Razorpay Script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setErrorMsg('Failed to load Razorpay payment gateway. Please check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on the server API route
      const createOrderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          deliveryType: formData.deliveryType,
          basePrice: basePrice,
          courseTitle: courseTitle,
          courseSlug: courseSlug,
          addressDetails: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        }),
      });

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok) {
        throw new Error(orderData.error || 'Failed to create payment order.');
      }

      // 2. Configure Razorpay Standard Checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: courseTitle,
        description: 'Bhagavad Gita & Book Materials',
        image: 'https://courses.radheshyamdas.com/logos/625ff3130cf26e4a8b9e83ce.png',
        order_id: orderData.orderId,
        handler: async function (response) {
          setLoading(true);
          try {
            // 3. Verify payment signature on the server
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }

            const paidAmount = formData.deliveryType === 'delivery' ? (Number(basePrice) + 50) : Number(basePrice);
            // Redirect to Thank You page on success
            window.location.href = `/thank-you?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}&type=${formData.deliveryType}&amount=${paidAmount}&courseName=${encodeURIComponent(courseTitle)}&courseUrl=${encodeURIComponent(courseUrl)}`;
          } catch (err) {
            setErrorMsg(err.message || 'Signature verification failed. Please contact admin.');
            setLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.mobile,
        },
        theme: {
          color: '#1A1B4B', // Deep indigo color match
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during checkout setup.');
      setLoading(false);
    }
  };

  const currentPrice = formData.deliveryType === 'delivery' ? (Number(basePrice) + 50) : Number(basePrice);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Course Registration</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handlePaymentSubmit} className="modal-body">
          {errorMsg && (
            <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
              {errorMsg}
            </div>
          )}

          {/* Standard Fields */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control"
              placeholder="username@example.com"
              required
              disabled={loading}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>*This email will be used to grant you access on Graphy.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="form-control"
              placeholder="e.g. +91 9876543210"
              required
              disabled={loading}
            />
          </div>

          {/* Pick Up or Delivery Options */}
          <div className="form-group">
            <label className="form-label">Book Materials Distribution</label>
            <div className="radio-group">
              
              <div 
                className={`radio-card ${formData.deliveryType === 'pickup' ? 'selected' : ''}`}
                onClick={() => !loading && setFormData(prev => ({ ...prev, deliveryType: 'pickup' }))}
              >
                <input 
                  type="radio" 
                  name="deliveryType" 
                  value="pickup" 
                  checked={formData.deliveryType === 'pickup'} 
                  onChange={() => {}}
                  disabled={loading}
                />
                <div className="radio-card-content">
                  <span className="radio-card-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Library size={15} /> Self Pick Up
                  </span>
                  <span className="radio-card-desc">Collect from ISKCON Pune. Price: ₹200</span>
                </div>
              </div>

              <div 
                className={`radio-card ${formData.deliveryType === 'delivery' ? 'selected' : ''}`}
                onClick={() => !loading && setFormData(prev => ({ ...prev, deliveryType: 'delivery' }))}
              >
                <input 
                  type="radio" 
                  name="deliveryType" 
                  value="delivery" 
                  checked={formData.deliveryType === 'delivery'} 
                  onChange={() => {}}
                  disabled={loading}
                />
                <div className="radio-card-content">
                  <span className="radio-card-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Truck size={15} /> Home Delivery
                  </span>
                  <span className="radio-card-desc">Delivered to your address. Price: ₹250</span>
                </div>
              </div>

            </div>
          </div>

          {/* Address Fields - Collapsible Grid */}
          <div className={`shipping-expand ${formData.deliveryType === 'delivery' ? 'open' : ''}`}>
            <div style={{ padding: '8px 0 16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Shipping Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="2"
                  placeholder="Flat No, Apartment, Street name, Area details"
                  disabled={loading}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="address-grid">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="City"
                    disabled={loading}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="State"
                    disabled={loading}
                  />
                </div>

                <div className="form-group col-span-2" style={{ marginBottom: 0 }}>
                  <label className="form-label">Pincode (ZIP Code)</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="6-digit Pincode"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price & Submit Action */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Registration Fee:</span>
                <h3 style={{ fontSize: '26px', color: 'var(--primary)', fontWeight: '800' }}>₹{currentPrice}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2E7D32', fontSize: '13px', fontWeight: '600' }}>
                <ShieldCheck size={16} /> Secure checkout
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} style={{ animation: 'spin 1s linear infinite' }} /> Processing...
                </>
              ) : (
                `Proceed to Pay ₹${currentPrice}`
              )}
            </button>
          </div>
        </form>

      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
