import React, { useState, useEffect } from 'react';
import { rust_airbnb_backend } from '../../declarations/rust-airbnb-backend';

function SignupLogin({ onLogin }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [error, setError] = useState('');

  async function signup() {
    try {
      const success = await rust_airbnb_backend.signup({ id, password, name });
      if (success) {
        alert("Signup successful! Please login.");
      } else {
        setError("User already exists.");
      }
    } catch (e) {
      setError("Signup failed. Try again.");
    }
  }

  async function login() {
    try {
      const success = await rust_airbnb_backend.login(id, password);
      if (success) {
        setLoggedInUser({ id, name });
        onLogin({ id, name });
      } else {
        setError("Invalid id or password.");
      }
    } catch (e) {
      setError("Login failed. Try again.");
    }
  }

  if (loggedInUser) {
    return <div>Hello, {loggedInUser.name}!</div>;
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '40px 20px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
      marginBottom: '40px'
    }}>
      <h3 style={{
        textAlign: 'center',
        color: '#222',
        marginBottom: '30px',
        fontSize: '24px',
        fontWeight: '600'
      }}>Welcome to Rust Airbnb</h3>
      <div style={{ marginBottom: '15px' }}>
        <input 
          placeholder="Email or Phone" 
          value={id} 
          onChange={e => setId(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <input 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <input 
          placeholder="Full Name (for signup)" 
          value={name} 
          onChange={e => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={signup}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#FF385C',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Sign Up
        </button>
        <button 
          onClick={login}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#fff',
            color: '#FF385C',
            border: '2px solid #FF385C',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Log In
        </button>
      </div>
      {error && <div style={{
        color: '#c41e3a',
        marginTop: '15px',
        textAlign: 'center',
        fontSize: '14px'
      }}>{error}</div>}
    </div>
  );
}

function Listings({ onSelectListing }) {
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 5;

  // Placeholder images for demo
  const placeholderImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'
  ];

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching listings with page:', page, 'limit:', limit);
        
        const results = await rust_airbnb_backend.get_listings(page, limit);
        console.log("Fetch result:", results);
        
        if (results && Array.isArray(results)) {
          setListings(results);
        } else {
          console.error("Invalid results format:", results);
          setError("Invalid data format received");
        }
      } catch (e) {
        console.error("Error fetching listings:", e);
        setError("Failed to load listings: " + e.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchListings();
  }, [page]);

  if (loading) {
    return <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      fontSize: '18px',
      color: '#666'
    }}>Loading amazing places...</div>;
  }

  if (error) {
    return <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      color: '#c41e3a',
      fontSize: '16px'
    }}>Error: {error}</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #ebebeb'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#222',
          margin: 0
        }}>
          Places to stay
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <button 
            disabled={page === 0} 
            onClick={() => setPage(page - 1)}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: page === 0 ? '#f7f7f7' : '#fff',
              color: page === 0 ? '#999' : '#222',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            ← Previous
          </button>
          <span style={{ color: '#666', fontSize: '14px' }}>Page {page + 1}</span>
          <button 
            onClick={() => setPage(page + 1)}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fff',
              color: '#222',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {listings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: '#666'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>No listings found.</p>
          <p style={{ fontSize: '14px', color: '#999' }}>Debug info: Received {listings.length} listings</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {listings.map((listing, index) => (
            <div 
              key={listing.id} 
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <img
                  src={placeholderImages[index % placeholderImages.length]}
                  alt={listing.title}
                  style={{
                    width: '100%',
                    height: '240px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    backgroundColor: '#f0f0f0'
                  }}
                />
                <button
                  onClick={() => onSelectListing(listing)}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    padding: '8px 16px',
                    backgroundColor: '#FF385C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  Reserve
                </button>
              </div>
              
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#222',
                    margin: 0,
                    lineHeight: '20px'
                  }}>
                    {listing.location}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ color: '#FFB400', fontSize: '12px' }}>★</span>
                    <span style={{ fontSize: '12px', color: '#222' }}>
                      {(4.2 + Math.random() * 0.8).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <p style={{
                  fontSize: '14px',
                  color: '#717171',
                  margin: '0 0 4px 0',
                  lineHeight: '18px'
                }}>
                  {listing.title}
                </p>
                
                <p style={{
                  fontSize: '14px',
                  color: '#717171',
                  margin: '0 0 8px 0'
                }}>
                  {Math.floor(Math.random() * 20) + 5} kilometers away
                </p>
                
                <div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#222'
                  }}>
                    ${(() => {
                      try {
                        const price = listing.price_per_night;
                        return typeof price === 'bigint' ? Number(price) : price;
                      } catch {
                        return listing.price_per_night;
                      }
                    })()}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    color: '#717171',
                    fontWeight: '400'
                  }}>
                    {' '}night
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Fixed Booking Confirmation Component
function BookingConfirmation({ user, selectedListing, bookingDetails, onConfirmBooking, onBack }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+82');
  const [isConfirming, setIsConfirming] = useState(false);

  // Add safety checks for required props
  if (!selectedListing || !bookingDetails) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        fontSize: '18px',
        color: '#666'
      }}>
        Missing booking information. Please try again.
        <br />
        <button onClick={onBack} style={{
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: '#FF385C',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Go Back
        </button>
      </div>
    );
  }

  const calculateNights = () => {
    try {
      if (!bookingDetails || !bookingDetails.checkIn || !bookingDetails.checkOut) {
        return 1;
      }
      
      const checkIn = new Date(bookingDetails.checkIn);
      const checkOut = new Date(bookingDetails.checkOut);
      
      // Check if dates are valid
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        console.warn('Invalid dates:', bookingDetails.checkIn, bookingDetails.checkOut);
        return 1;
      }
      
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return nights > 0 ? nights : 1;
    } catch (error) {
      console.error('Error calculating nights:', error, bookingDetails);
      return 1;
    }
  };

  const nights = calculateNights();
  
  // Safely handle price_per_night in case it's a BigInt from Rust
  const pricePerNight = (() => {
    try {
      const price = selectedListing?.price_per_night;
      if (typeof price === 'bigint') {
        return Number(price);
      }
      return Number(price) || 0;
    } catch (error) {
      console.error('Error converting price:', error, selectedListing?.price_per_night);
      return 0;
    }
  })();
  
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.14); // 14% service fee
  const taxes = Math.round(subtotal * 0.12); // 12% taxes
  const total = subtotal + serviceFee + taxes;

  const handleContinue = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter your phone number');
      return;
    }
    
    setIsConfirming(true);
    try {
      await onConfirmBooking({
        ...bookingDetails,
        phoneNumber: countryCode + phoneNumber,
        total
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Invalid date';
      
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '0 20px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '40px'
      }}>
        {/* Left Column */}
        <div>
          {/* Back button */}
          <button 
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              fontSize: '16px',
              color: '#222',
              cursor: 'pointer',
              marginBottom: '24px',
              padding: '8px 0'
            }}
          >
            ← Request to book
          </button>

          {/* Rare find banner */}
          <div style={{
            padding: '20px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                This is a rare find.
              </h4>
              <p style={{ margin: 0, color: '#717171', fontSize: '14px' }}>
                {selectedListing.title} is usually booked.
              </p>
            </div>
            <div style={{ fontSize: '24px', color: '#FF385C' }}>💎</div>
          </div>

          {/* Trip details */}
          <div style={{
            padding: '24px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            marginBottom: '32px'
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: '600',
              margin: '0 0 24px 0'
            }}>
              Your trip
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Dates</h4>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#222',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  Edit
                </button>
              </div>
              <p style={{ margin: 0, color: '#717171' }}>
                {formatDate(bookingDetails.checkIn)} – {formatDate(bookingDetails.checkOut)}
              </p>
            </div>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Guests</h4>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#222',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  Edit
                </button>
              </div>
              <p style={{ margin: 0, color: '#717171' }}>
                {bookingDetails.guests} guest{bookingDetails.guests !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Login section */}
          <div style={{
            padding: '24px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px'
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: '600',
              margin: '0 0 24px 0'
            }}>
              Log in or sign up to book
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                border: '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={{
                    padding: '12px',
                    border: 'none',
                    borderRight: '1px solid #ddd',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    minWidth: '120px'
                  }}
                >
                  <option value="+82">South Korea (+82)</option>
                  <option value="+1">United States (+1)</option>
                  <option value="+44">United Kingdom (+44)</option>
                  <option value="+91">India (+91)</option>
                  <option value="+81">Japan (+81)</option>
                </select>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <p style={{
              fontSize: '12px',
              color: '#717171',
              marginBottom: '20px',
              lineHeight: '16px'
            }}>
              We'll call or text you to confirm your number. Standard message and data rates apply.{' '}
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                Privacy Policy
              </span>
            </p>

            <button
              onClick={handleContinue}
              disabled={isConfirming}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: isConfirming ? '#ccc' : '#E31C5F',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isConfirming ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isConfirming ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>

        {/* Right Column - Price details */}
        <div style={{
          position: 'sticky',
          top: '20px',
          height: 'fit-content'
        }}>
          <div style={{
            padding: '24px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px'
          }}>
            {/* Property info */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '1px solid #ebebeb'
            }}>
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=100&fit=crop"
                alt={selectedListing.title}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
              <div>
                <h4 style={{
                  margin: '0 0 4px 0',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {selectedListing.title}
                </h4>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#717171' }}>
                  {selectedListing.location}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#FFB400', fontSize: '12px' }}>★</span>
                  <span style={{ fontSize: '12px', color: '#222' }}>
                    5.00 (6 reviews)
                  </span>
                  <span style={{ 
                    fontSize: '12px',
                    backgroundColor: '#222',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginLeft: '4px'
                  }}>
                    Superhost
                  </span>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              margin: '0 0 20px 0'
            }}>
              Price details
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
                fontSize: '16px'
              }}>
                <span>${pricePerNight} x {nights} nights</span>
                <span>${subtotal}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
                fontSize: '16px'
              }}>
                <span>Service fee</span>
                <span>${serviceFee}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
                fontSize: '16px'
              }}>
                <span>Taxes</span>
                <span>${taxes}</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid #ebebeb',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              <span>Total (USD)</span>
              <span>${total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservationForm({ userId, selectedListing, onReservationDone, onShowBookingConfirmation }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');

  function handleReserve() {
    if (!checkIn || !checkOut || !selectedListing) {
      setMessage("Please fill all fields.");
      return;
    }

    // Show booking confirmation instead of direct booking
    onShowBookingConfirmation({
      checkIn,
      checkOut,
      guests
    });
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '32px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        fontSize: '22px',
        fontWeight: '600',
        color: '#222',
        marginBottom: '24px'
      }}>
        Reserve: {selectedListing?.title}
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#222',
            marginBottom: '8px'
          }}>
            Check-in
          </label>
          <input 
            type="date" 
            value={checkIn} 
            onChange={e => setCheckIn(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#222',
            marginBottom: '8px'
          }}>
            Check-out
          </label>
          <input 
            type="date" 
            value={checkOut} 
            onChange={e => setCheckOut(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#222',
          marginBottom: '8px'
        }}>
          Guests
        </label>
        <input 
          type="number" 
          min="1" 
          value={guests} 
          onChange={e => setGuests(parseInt(e.target.value))}
          style={{
            width: '120px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
      </div>
      
      <button 
        onClick={handleReserve}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#FF385C',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Continue to Booking
      </button>
      
      {message && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('successful') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px',
          color: message.includes('successful') ? '#155724' : '#721c24',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

function UserReservations({ userId, refreshKey }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservations() {
      try {
        setLoading(true);
        console.log('Fetching reservations for user:', userId);
        const res = await rust_airbnb_backend.get_reservations(userId);
        console.log('Fetched reservations:', res);
        setReservations(res);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      fetchReservations();
    }
  }, [userId, refreshKey]); // Add refreshKey as dependency

  if (loading) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '32px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <p style={{ color: '#666', fontSize: '16px' }}>Loading your reservations...</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '32px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        fontSize: '22px',
        fontWeight: '600',
        color: '#222',
        marginBottom: '24px'
      }}>
        Your Reservations
      </h3>
      
      {reservations.length === 0 ? (
        <div style={{ 
          textAlign: 'center',
          padding: '40px 20px',
          color: '#717171' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '500' }}>
            No reservations yet
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Your bookings will appear here once you make a reservation.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reservations.map(r => (
            <div 
              key={r.id}
              style={{
                padding: '24px',
                border: '1px solid #ddd',
                borderRadius: '12px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#222' }}>
                    Reservation #{r.id}
                  </h4>
                  <p style={{ margin: '0 0 4px 0', color: '#717171', fontSize: '14px' }}>
                    Listing ID: {r.listing_id}
                  </p>
                  <p style={{ margin: '0 0 4px 0', color: '#717171', fontSize: '14px' }}>
                    Guests: {r.guests}
                  </p>
                  <p style={{ margin: '0', color: '#717171', fontSize: '12px' }}>
                    Booked on: {(() => {
                      try {
                        return r.created_at 
                          ? new Date(r.created_at).toLocaleDateString()
                          : 'Unknown';
                      } catch (error) {
                        return 'Unknown';
                      }
                    })()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#717171', marginBottom: '8px' }}>
                    {/* Safely handle BigInt timestamps from Rust backend */}
                    {(() => {
                      try {
                        const checkInDate = typeof r.check_in === 'bigint' 
                          ? new Date(Number(r.check_in / BigInt(1000000))) // Convert nanoseconds to milliseconds
                          : new Date(r.check_in);
                        const checkOutDate = typeof r.check_out === 'bigint'
                          ? new Date(Number(r.check_out / BigInt(1000000))) // Convert nanoseconds to milliseconds
                          : new Date(r.check_out);
                        
                        return `${checkInDate.toLocaleDateString()} → ${checkOutDate.toLocaleDateString()}`;
                      } catch (error) {
                        console.error('Error formatting dates:', error, r);
                        return 'Invalid dates';
                      }
                    })()}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#28a745', 
                    backgroundColor: '#d4edda',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontWeight: '600'
                  }}>
                    ✓ Confirmed
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [refreshReservations, setRefreshReservations] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const handleShowBookingConfirmation = (details) => {
    console.log('Showing booking confirmation with details:', details);
    setBookingDetails(details);
    setShowBookingConfirmation(true);
  };

  const handleConfirmBooking = async (finalBookingDetails) => {
    try {
      // Ensure dates are properly formatted
      const checkInDate = new Date(finalBookingDetails.checkIn);
      const checkOutDate = new Date(finalBookingDetails.checkOut);
      
      // Convert to nanoseconds for Rust backend (if that's what it expects)
      const checkInTime = BigInt(checkInDate.getTime()) * BigInt(1000000);
      const checkOutTime = BigInt(checkOutDate.getTime()) * BigInt(1000000);

      console.log('Booking details:', {
        userId: user.id,
        listingId: selectedListing.id,
        checkIn: checkInTime.toString(),
        checkOut: checkOutTime.toString(),
        guests: finalBookingDetails.guests
      });

      const res = await rust_airbnb_backend.reserve(
        user.id, 
        selectedListing.id, 
        checkInTime, 
        checkOutTime, 
        finalBookingDetails.guests
      );
      
      console.log('Backend response:', res);
      
      if (res && 'err' in res) {
        alert(`Reservation failed: ${res.err}`);
      } else {
        alert("Reservation successful!");
        setSelectedListing(null);
        setShowBookingConfirmation(false);
        setBookingDetails(null);
        setRefreshReservations(prev => !prev);
      }
    } catch (e) {
      console.error("Reservation error:", e);
      alert("Reservation error: " + e.toString());
    }
  };

  const handleBackToReservation = () => {
    console.log('Going back to reservation form');
    setShowBookingConfirmation(false);
    setBookingDetails(null);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f7f7f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #ddd',
        padding: '16px 0',
        marginBottom: user ? '40px' : '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#FF385C',
            margin: 0
          }}>
            🏠 Rust Airbnb
          </h1>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: '#222', fontSize: '14px' }}>
                Welcome, {user.name}!
              </span>
              <button 
                onClick={() => { 
                  setUser(null); 
                  setSelectedListing(null);
                  setShowBookingConfirmation(false);
                  setBookingDetails(null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fff',
                  color: '#222',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {!user ? (
        <SignupLogin onLogin={setUser} />
      ) : showBookingConfirmation ? (
        <BookingConfirmation
          user={user}
          selectedListing={selectedListing}
          bookingDetails={bookingDetails}
          onConfirmBooking={handleConfirmBooking}
          onBack={handleBackToReservation}
        />
      ) : (
        <>
          <Listings onSelectListing={setSelectedListing} />
          {selectedListing && (
            <ReservationForm
              userId={user.id}
              selectedListing={selectedListing}
              onReservationDone={() => {
                setSelectedListing(null);
                setRefreshReservations(!refreshReservations);
              }}
              onShowBookingConfirmation={handleShowBookingConfirmation}
            />
          )}
          <UserReservations userId={user.id} refreshKey={refreshReservations} />
        </>
      )}
    </div>
  );
}