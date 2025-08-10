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
      setError('');
      console.log('Attempting signup with:', { id, name });
      const success = await rust_airbnb_backend.signup({ id, password, name });
      console.log('Signup result:', success);
      if (success) {
        alert("Signup successful! Please login.");
        setName(''); // Clear name field after signup
      } else {
        setError("User already exists.");
      }
    } catch (e) {
      console.error('Signup error:', e);
      setError("Signup failed. Try again.");
    }
  }

  async function login() {
    try {
      setError('');
      console.log('Attempting login with:', id);
      const success = await rust_airbnb_backend.login(id, password);
      console.log('Login result:', success);
      if (success) {
        setLoggedInUser({ id, name: name || id });
        onLogin({ id, name: name || id });
      } else {
        setError("Invalid id or password.");
      }
    } catch (e) {
      console.error('Login error:', e);
      setError("Login failed. Try again.");
    }
  }

  if (loggedInUser) {
    return <div>Hello, {loggedInUser.name}!</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
      <h3>Signup / Login</h3>
      <div style={{ marginBottom: '10px' }}>
        <input 
          placeholder="ID" 
          value={id} 
          onChange={e => setId(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input 
          placeholder="Name (for signup)" 
          value={name} 
          onChange={e => setName(e.target.value)}
          style={{ padding: '8px' }}
        />
      </div>
      <button onClick={signup} style={{ marginRight: '10px', padding: '8px 16px' }}>Sign Up</button>
      <button onClick={login} style={{ padding: '8px 16px' }}>Log In</button>
      {error && <div style={{color:'red', marginTop: '10px'}}>{error}</div>}
    </div>
  );
}

function Listings({ onSelectListing }) {
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 5;

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        setError('');
        console.log('=== FETCHING LISTINGS ===');
        console.log('Page:', page, 'Limit:', limit);
        
        const results = await rust_airbnb_backend.get_listings(page, limit);
        
        console.log('Raw results:', results);
        console.log('Results type:', typeof results);
        console.log('Is array:', Array.isArray(results));
        console.log('Results length:', results?.length);
        
        if (results && Array.isArray(results)) {
          console.log('Setting listings:', results);
          setListings(results);
        } else {
          console.error('Invalid results format:', results);
          setError('Invalid data format received from backend');
          setListings([]);
        }
      } catch (e) {
        console.error('Error fetching listings:', e);
        setError('Failed to load listings: ' + e.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchListings();
  }, [page]);

  if (loading) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
        <h3>Available Listings</h3>
        <div>Loading listings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
        <h3>Available Listings</h3>
        <div style={{color: 'red'}}>Error: {error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
      <h3>Available Listings (Page {page + 1})</h3>
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        Debug: Found {listings.length} listings
      </div>
      
      {listings.length === 0 ? (
        <div>
          <p>No listings found.</p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            Debug: listings.length = {listings.length}, typeof listings = {typeof listings}
          </p>
        </div>
      ) : (
        <div>
          {listings.map(listing => (
            <div key={listing.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              marginBottom: '10px',
              backgroundColor: '#f9f9f9'
            }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{listing.title}</h4>
              <p style={{ margin: '0 0 8px 0', color: '#666' }}>{listing.description}</p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Location:</strong> {listing.location}
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Price:</strong> ${listing.price_per_night} / night
              </p>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#999' }}>
                ID: {listing.id}
              </p>
              <button 
                onClick={() => onSelectListing(listing)}
                style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Reserve
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button 
          disabled={page === 0} 
          onClick={() => setPage(page - 1)}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Prev Page
        </button>
        <span style={{ margin: '0 10px' }}>Page {page + 1}</span>
        <button 
          onClick={() => setPage(page + 1)}
          style={{ padding: '8px 16px' }}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}

function ReservationForm({ userId, selectedListing, onReservationDone }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');

  async function handleReserve() {
    if (!checkIn || !checkOut || !selectedListing) {
      setMessage("Please fill all fields.");
      return;
    }
    
    const checkInTime = new Date(checkIn).getTime() * 1000000;  // nanoseconds for IC Time
    const checkOutTime = new Date(checkOut).getTime() * 1000000;

    try {
      setMessage('Processing reservation...');
      const res = await rust_airbnb_backend.reserve(userId, selectedListing.id, BigInt(checkInTime), BigInt(checkOutTime), guests);
      console.log('Reservation result:', res);
      
      if (res && 'err' in res) {
        setMessage(`Reservation failed: ${res.err}`);
      } else if (res && ('ok' in res || res.id)) {
        setMessage("Reservation successful!");
        setTimeout(() => {
          onReservationDone();
        }, 2000);
      } else {
        setMessage("Reservation completed!");
        setTimeout(() => {
          onReservationDone();
        }, 2000);
      }
    } catch (e) {
      console.error('Reservation error:', e);
      setMessage("Reservation error: " + e.toString());
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px', backgroundColor: '#f0f8ff' }}>
      <h3>Reserve: {selectedListing?.title}</h3>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Check-in Date:
          <input 
            type="date" 
            value={checkIn} 
            onChange={e => setCheckIn(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Check-out Date:
          <input 
            type="date" 
            value={checkOut} 
            onChange={e => setCheckOut(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Number of Guests:
          <input 
            type="number" 
            min="1" 
            value={guests} 
            onChange={e => setGuests(parseInt(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px', width: '60px' }}
          />
        </label>
      </div>
      <button 
        onClick={handleReserve}
        style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Confirm Reservation
      </button>
      {message && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da', border: '1px solid #ccc', borderRadius: '4px' }}>
          {message}
        </div>
      )}
    </div>
  );
}

function UserReservations({ userId }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservations() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const res = await rust_airbnb_backend.get_reservations(userId);
        console.log('Reservations:', res);
        setReservations(res || []);
      } catch (e) {
        console.error('Error fetching reservations:', e);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReservations();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc' }}>
        <h3>Your Reservations</h3>
        <div>Loading reservations...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h3>Your Reservations</h3>
      {reservations.length === 0 ? (
        <p>No reservations yet.</p>
      ) : (
        <div>
          {reservations.map(r => (
            <div key={r.id} style={{ 
              border: '1px solid #ddd', 
              padding: '10px', 
              marginBottom: '10px',
              backgroundColor: '#fff'
            }}>
              <strong>Reservation #{r.id}</strong><br />
              Listing ID: {r.listing_id}<br />
              Check-in: {new Date(Number(r.check_in) / 1000000).toLocaleDateString()}<br />
              Check-out: {new Date(Number(r.check_out) / 1000000).toLocaleDateString()}<br />
              Guests: {r.guests}
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

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Rust Airbnb Demo</h1>
      
      {!user ? (
        <SignupLogin onLogin={setUser} />
      ) : (
        <>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <span style={{ marginRight: '20px' }}>Welcome, {user.name}!</span>
            <button 
              onClick={() => { 
                setUser(null); 
                setSelectedListing(null); 
              }}
              style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Logout
            </button>
          </div>
          
          <Listings onSelectListing={setSelectedListing} />
          
          {selectedListing && (
            <ReservationForm
              userId={user.id}
              selectedListing={selectedListing}
              onReservationDone={() => {
                setSelectedListing(null);
                setRefreshReservations(!refreshReservations);
              }}
            />
          )}
          
          <UserReservations userId={user.id} key={refreshReservations.toString()} />
        </>
      )}
    </div>
  );
}