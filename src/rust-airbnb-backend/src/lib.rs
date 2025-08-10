use candid::{CandidType, Deserialize};
use ic_cdk::api::time;
use ic_cdk_macros::{update, query, init};
use std::cell::RefCell;
use std::collections::HashMap;
use serde::Serialize;

/// ----------------------
///   Data Models
/// ----------------------
#[derive(CandidType, Deserialize, Clone, Serialize)]
pub struct User {
    pub id: String,
    pub password: String,
    pub name: String,
}

#[derive(CandidType, Deserialize, Clone, Serialize)]
pub struct Listing {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub price_per_night: u64,
    pub location: String,
    pub photos: Vec<String>,
    pub amenities: Vec<String>,
}

#[derive(CandidType, Deserialize, Clone, Serialize)]
pub struct Reservation {
    pub id: u64,
    pub user_id: String,
    pub listing_id: u64,
    pub check_in: u64,  // Timestamp
    pub check_out: u64, // Timestamp
    pub guests: u32,
    pub created_at: u64,
}

/// ----------------------
///   State (using RefCell<HashMap>)
/// ----------------------

thread_local! {
    static USERS: RefCell<HashMap<String, User>> = RefCell::new(HashMap::new());
    static LISTINGS: RefCell<HashMap<u64, Listing>> = RefCell::new(HashMap::new());
    static RESERVATIONS: RefCell<HashMap<u64, Reservation>> = RefCell::new(HashMap::new());
    static RES_COUNTER: RefCell<u64> = RefCell::new(0);
    static LISTING_COUNTER: RefCell<u64> = RefCell::new(0);
}

/// ----------------------
///   Initialization
/// ----------------------
#[init]
fn init() {
    add_sample_listings();
}

/// ----------------------
///   Helper Functions
/// ----------------------
fn is_date_overlap(a_start: u64, a_end: u64, b_start: u64, b_end: u64) -> bool {
    !(a_end <= b_start || b_end <= a_start)
}

/// ----------------------
///   Sample Data
/// ----------------------
#[update]
pub fn add_sample_listings() {
    let sample_listings = vec![
        Listing {
            id: 1,
            title: "Cozy Downtown Apartment".to_string(),
            description: "A beautiful apartment in the heart of the city with modern amenities.".to_string(),
            price_per_night: 120,
            location: "New York, NY".to_string(),
            photos: vec!["photo1.jpg".to_string(), "photo2.jpg".to_string()],
            amenities: vec!["WiFi".to_string(), "Kitchen".to_string(), "AC".to_string()],
        },
        Listing {
            id: 2,
            title: "Beachfront Villa".to_string(),
            description: "Stunning oceanfront property with private beach access.".to_string(),
            price_per_night: 350,
            location: "Miami, FL".to_string(),
            photos: vec!["beach1.jpg".to_string(), "beach2.jpg".to_string()],
            amenities: vec!["Pool".to_string(), "Beach Access".to_string(), "WiFi".to_string(), "Parking".to_string()],
        },
        Listing {
            id: 3,
            title: "Mountain Cabin Retreat".to_string(),
            description: "Peaceful cabin surrounded by nature, perfect for hiking enthusiasts.".to_string(),
            price_per_night: 85,
            location: "Aspen, CO".to_string(),
            photos: vec!["cabin1.jpg".to_string()],
            amenities: vec!["Fireplace".to_string(), "Hiking Trails".to_string(), "WiFi".to_string()],
        },
        Listing {
            id: 4,
            title: "Historic Brownstone".to_string(),
            description: "Charming historic home with modern updates in a quiet neighborhood.".to_string(),
            price_per_night: 200,
            location: "Boston, MA".to_string(),
            photos: vec!["brownstone1.jpg".to_string(), "brownstone2.jpg".to_string()],
            amenities: vec!["WiFi".to_string(), "Kitchen".to_string(), "Garden".to_string(), "Parking".to_string()],
        },
        Listing {
            id: 5,
            title: "Modern Loft".to_string(),
            description: "Sleek and stylish loft with city skyline views.".to_string(),
            price_per_night: 180,
            location: "San Francisco, CA".to_string(),
            photos: vec!["loft1.jpg".to_string()],
            amenities: vec!["WiFi".to_string(), "City Views".to_string(), "Gym Access".to_string()],
        },
        Listing {
            id: 6,
            title: "Country Farmhouse".to_string(),
            description: "Rustic farmhouse with acres of land and farm animals.".to_string(),
            price_per_night: 95,
            location: "Austin, TX".to_string(),
            photos: vec!["farm1.jpg".to_string(), "farm2.jpg".to_string()],
            amenities: vec!["WiFi".to_string(), "Farm Experience".to_string(), "Large Kitchen".to_string()],
        },
    ];

    LISTINGS.with(|table| {
        let mut table = table.borrow_mut();
        for listing in sample_listings {
            ic_cdk::println!("Adding sample listing: {}", listing.title);
            table.insert(listing.id, listing);
        }
    });
    
    ic_cdk::println!("Sample listings added successfully!");
}

/// ----------------------
///   User APIs
/// ----------------------
#[update]
fn signup(user: User) -> bool {
    USERS.with(|table| {
        let mut table = table.borrow_mut();
        if !table.contains_key(&user.id) {
            table.insert(user.id.clone(), user);
            true
        } else {
            false
        }
    })
}

#[query]
fn login(id: String, password: String) -> bool {
    USERS.with(|table| {
        let table = table.borrow();
        match table.get(&id) {
            Some(user) => user.password == password,
            None => false,
        }
    })
}

/// ----------------------
///   Listing APIs
/// ----------------------

#[query]
fn get_listings(page: u64, limit: u64) -> Vec<Listing> {
    LISTINGS.with(|table| {
        let table = table.borrow();
        ic_cdk::println!("Fetching listings - total count: {}", table.len());
        let mut all: Vec<Listing> = table.values().cloned().collect();
        // Sort by ID for consistent pagination
        all.sort_by_key(|listing| listing.id);
        
        let start = (page * limit) as usize;
        let end = ((page + 1) * limit) as usize;
        let result = all.get(start..end).unwrap_or(&[]).to_vec();
        ic_cdk::println!("Returning {} listings for page {}", result.len(), page);
        result
    })
}

#[update]
fn add_listing(mut listing: Listing) {
    // Auto-generate ID if not provided
    if listing.id == 0 {
        listing.id = LISTING_COUNTER.with(|c| {
            let mut val = c.borrow_mut();
            *val += 1000; // Start from 1000 to avoid conflicts with sample data
            *val
        });
    }
    
    ic_cdk::println!("Adding listing id: {}", listing.id);
    LISTINGS.with(|table| {
        let mut table = table.borrow_mut();
        table.insert(listing.id, listing);
    });
}

#[query]
fn get_listings_count() -> u64 {
    LISTINGS.with(|table| {
        let table = table.borrow();
        table.len() as u64
    })
}

/// ----------------------
///   Reservation APIs
/// ----------------------
#[query]
fn check_availability(listing_id: u64, check_in: u64, check_out: u64) -> bool {
    if check_out <= check_in {
        return false;
    }
    RESERVATIONS.with(|table| {
        let table = table.borrow();
        !table.values().any(|r| {
            r.listing_id == listing_id && is_date_overlap(check_in, check_out, r.check_in, r.check_out)
        })
    })
}

#[update]
fn reserve(
    user_id: String,
    listing_id: u64,
    check_in: u64,
    check_out: u64,
    guests: u32,
) -> Result<Reservation, String> {
    if check_out <= check_in {
        return Err("Invalid date range".into());
    }

    if !check_availability(listing_id, check_in, check_out) {
        return Err("Listing not available for given dates".into());
    }

    let id = RES_COUNTER.with(|c| {
        let mut val = c.borrow_mut();
        *val += 1;
        *val
    });

    let reservation = Reservation {
        id,
        user_id,
        listing_id,
        check_in,
        check_out,
        guests,
        created_at: time(),
    };

    RESERVATIONS.with(|table| {
        let mut table = table.borrow_mut();
        table.insert(id, reservation.clone());
    });

    Ok(reservation)
}

#[query]
fn get_reservations(user_id: String) -> Vec<Reservation> {
    RESERVATIONS.with(|table| {
        let table = table.borrow();
        table.values()
            .filter(|r| r.user_id == user_id)
            .cloned()
            .collect()
    })
}

#[update]
fn cancel_reservation(reservation_id: u64, user_id: String) -> bool {
    RESERVATIONS.with(|table| {
        let mut table = table.borrow_mut();
        if let Some(r) = table.get(&reservation_id) {
            if r.user_id == user_id {
                table.remove(&reservation_id);
                return true;
            }
        }
        false
    })
}

/// ----------------------
///   Candid Export
/// ----------------------
ic_cdk::export_candid!();