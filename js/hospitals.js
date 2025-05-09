<<<<<<< HEAD
// Global variables
let map;
let directionsService;
let directionsRenderer;
let currentLocationMarker;
let hospitalMarkers = [];
let currentLocation = null;
let autocomplete;

// Sample hospital data for Coimbatore
const hospitals = [
    {
        id: 1,
        name: "PSG Hospitals",
        address: "Peelamedu, Avinashi Road, Coimbatore - 641004",
        distance: 1.3,
        rating: 4.8,
        waitTime: 20,
        waitTimeLevel: "low",
        specialties: ["emergency", "cardiology", "neurology", "orthopedics"],
        phone: "+91 422 2570170",
        lat: 11.0186,
        lng: 77.0199
    },
    {
        id: 2,
        name: "Sri Ramakrishna Hospital",
        address: "395, Sarojini Naidu Road, Coimbatore - 641044",
        distance: 1.2,
        rating: 4.6,
        waitTime: 30,
        waitTimeLevel: "medium",
        specialties: ["emergency", "pediatrics", "dermatology", "ENT"],
        phone: "+91 422 4500000",
        lat: 11.0039,
        lng: 76.9618
    },
    {
        id: 3,
        name: "Kovai Medical Center and Hospital (KMCH)",
        address: "Avanashi Road, Coimbatore - 641014",
        distance: 5.5,
        rating: 4.7,
        waitTime: 35,
        waitTimeLevel: "medium",
        specialties: ["emergency", "pediatrics", "oncology", "cardiology"],
        phone: "+91 422 4323800",
        lat: 11.0274,
        lng: 77.0262
    },
    {
        id: 4,
        name: "G. Kuppuswamy Naidu Memorial Hospital",
        address: "Pappanaickenpalayam, Coimbatore - 641037",
        distance: 4.1,
        rating: 4.5,
        waitTime: 45,
        waitTimeLevel: "medium",
        specialties: ["emergency", "general surgery", "urology", "ophthalmology"],
        phone: "+91 422 2245000",
        lat: 11.0025,
        lng: 77.0089
    },
    {
        id: 5,
        name: "Aravind Eye Hospital",
        address: "Avanishi Road, Coimbatore - 641014",
        distance: 6.2,
        rating: 4.9,
        waitTime: 15,
        waitTimeLevel: "low",
        specialties: ["ophthalmology", "eye emergency"],
        phone: "+91 422 4365000",
        lat: 11.0356,
        lng: 77.0372
    }
];

// Initialize the map
function initMap() {
    try {
        // Remove loading indicator
        const mapElement = document.getElementById('hospital-map');
        mapElement.querySelector('.map-loading')?.remove();
        
        // Default to Coimbatore if no current location
        const defaultLocation = { lat: 11.0168, lng: 76.9558 };
        
        // Create the map
        map = new google.maps.Map(mapElement, {
            center: defaultLocation,
            zoom: 13,
            styles: [
                {
                    featureType: "poi.medical",
                    elementType: "geometry",
                    stylers: [{ color: "#e74c3c" }, { visibility: "on" }]
                },
                {
                    featureType: "poi.medical",
                    elementType: "labels.icon",
                    stylers: [{ visibility: "on" }]
                }
            ]
        });

        // Initialize services
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: "#3498db",
                strokeOpacity: 0.8,
                strokeWeight: 4
            }
        });

        // Initialize autocomplete
        autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('location-input'),
            { types: ['geocode'] }
        );

        // Display initial hospitals
        displayHospitals(hospitals);
        
    } catch (error) {
        console.error("Google Maps initialization error:", error);
        showMapError();
    }
}

// Show map error message
function showMapError() {
    const mapContainer = document.getElementById('hospital-map');
    mapContainer.innerHTML = `
        <div class="map-error">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Map Loading Error</h3>
            <p>We couldn't load the map properly. Please try the following:</p>
            <ul>
                <li>Refresh the page</li>
                <li>Check your internet connection</li>
                <li>Enable JavaScript in your browser</li>
            </ul>
            <button id="retry-map-btn" class="btn-primary">
                <i class="fas fa-sync-alt"></i> Retry Loading Map
            </button>
        </div>
    `;
    
    document.getElementById('retry-map-btn').addEventListener('click', function() {
        location.reload();
    });
}

// Display hospitals on the map and list
function displayHospitals(filteredHospitals) {
    // Clear previous markers
    clearHospitalMarkers();
    
    // Clear hospital list
    const hospitalList = document.getElementById('hospital-list');
    hospitalList.innerHTML = '';
    
    // Add markers to map and create list items
    filteredHospitals.forEach(hospital => {
        // Create marker
        const marker = new google.maps.Marker({
            position: { lat: hospital.lat, lng: hospital.lng },
            map: map,
            title: hospital.name,
            icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new google.maps.Size(32, 32)
            }
        });
        
        hospitalMarkers.push(marker);
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="map-info-window">
                    <h3>${hospital.name}</h3>
                    <p>${hospital.address}</p>
                    <p>Wait time: <span class="${getWaitTimeClass(hospital.waitTime)}">${hospital.waitTime} mins</span></p>
                    <button class="map-directions-btn" onclick="showDirections(${hospital.lat}, ${hospital.lng})">
                        <i class="fas fa-directions"></i> Get Directions
                    </button>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
            highlightHospitalCard(hospital.id);
        });
        
        // Create list item
        const hospitalCard = document.createElement('div');
        hospitalCard.className = 'hospital-card';
        hospitalCard.dataset.id = hospital.id;
        
        hospitalCard.innerHTML = `
            <div class="hospital-header">
                <div>
                    <h3 class="hospital-name">${hospital.name}</h3>
                    <div class="hospital-distance">
                        <i class="fas fa-location-arrow"></i> ${hospital.distance} km away
                    </div>
                </div>
                <div class="hospital-rating">
                    <i class="fas fa-star"></i> ${hospital.rating}
                </div>
            </div>
            <div class="hospital-details">
                <div class="hospital-detail">
                    <i class="fas fa-map-marker-alt"></i> ${hospital.address}
                </div>
                <div class="hospital-detail">
                    <i class="fas fa-phone"></i> ${hospital.phone}
                </div>
                <div class="hospital-detail">
                    <i class="fas fa-clock"></i> 
                    <span class="hospital-wait-time ${getWaitTimeClass(hospital.waitTime)}">
                        Wait time: ${hospital.waitTime} mins
                    </span>
                </div>
            </div>
            <div class="hospital-actions">
                <button class="btn-directions" data-id="${hospital.id}">
                    <i class="fas fa-directions"></i> Directions
                </button>
                <button class="btn-call" data-id="${hospital.id}">
                    <i class="fas fa-phone"></i> Call
                </button>
            </div>
        `;
        
        hospitalList.appendChild(hospitalCard);
        
        // Add click event to center map on hospital
        hospitalCard.addEventListener('click', function() {
            map.setCenter({ lat: hospital.lat, lng: hospital.lng });
            map.setZoom(15);
            infoWindow.open(map, marker);
            highlightHospitalCard(hospital.id);
        });
    });
    
    // Fit map to show all markers if we have more than one
    if (filteredHospitals.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        filteredHospitals.forEach(hospital => {
            bounds.extend(new google.maps.LatLng(hospital.lat, hospital.lng));
        });
        map.fitBounds(bounds);
    } else if (filteredHospitals.length === 1) {
        map.setCenter({ 
            lat: filteredHospitals[0].lat, 
            lng: filteredHospitals[0].lng 
        });
        map.setZoom(15);
    }
}

// Highlight the selected hospital card
function highlightHospitalCard(hospitalId) {
    document.querySelectorAll('.hospital-card').forEach(card => {
        card.classList.remove('active');
    });
    const selectedCard = document.querySelector(`.hospital-card[data-id="${hospitalId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Get wait time class
function getWaitTimeClass(waitTime) {
    if (waitTime <= 30) return 'wait-time-low';
    if (waitTime <= 60) return 'wait-time-medium';
    return 'wait-time-high';
}

// Clear all hospital markers
function clearHospitalMarkers() {
    hospitalMarkers.forEach(marker => {
        marker.setMap(null);
    });
    hospitalMarkers = [];
}

// Show directions from current location to hospital
function showDirections(lat, lng) {
    if (!currentLocation) {
        alert("Please enable your current location first");
        return;
    }
    
    const destination = new google.maps.LatLng(lat, lng);
    const origin = new google.maps.LatLng(currentLocation.lat, currentLocation.lng);
    
    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            
            // Add custom markers
            if (currentLocationMarker) {
                currentLocationMarker.setMap(null);
            }
            
            currentLocationMarker = new google.maps.Marker({
                position: origin,
                map: map,
                title: "Your Location",
                icon: {
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new google.maps.Size(32, 32)
                }
            });
            
            // Center the map on the route
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(origin);
            bounds.extend(destination);
            map.fitBounds(bounds);
        } else {
            alert('Directions request failed due to ' + status);
        }
    });
}

// Filter hospitals based on user input
function filterHospitals() {
    const specialty = document.getElementById('specialty-filter').value;
    const distance = parseInt(document.getElementById('distance-filter').value);
    const locationInput = document.getElementById('location-input').value.toLowerCase();
    
    let filtered = hospitals;
    
    // Filter by specialty
    if (specialty) {
        filtered = filtered.filter(hospital => 
            hospital.specialties.includes(specialty)
        );
    }
    
    // Filter by distance
    filtered = filtered.filter(hospital => 
        hospital.distance <= distance
    );
    
    // Filter by location search (if any)
    if (locationInput && locationInput !== "current location") {
        filtered = filtered.filter(hospital => 
            hospital.name.toLowerCase().includes(locationInput) || 
            hospital.address.toLowerCase().includes(locationInput)
        );
    }
    
    // Sort by active sort option
    const activeSort = document.querySelector('.sort-btn.active').dataset.sort;
    if (activeSort === 'distance') {
        filtered.sort((a, b) => a.distance - b.distance);
    } else if (activeSort === 'wait-time') {
        filtered.sort((a, b) => a.waitTime - b.waitTime);
    } else if (activeSort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    }
    
    displayHospitals(filtered);
}

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Center map on current location
                map.setCenter(currentLocation);
                map.setZoom(13);
                
                // Add current location marker
                if (currentLocationMarker) {
                    currentLocationMarker.setMap(null);
                }
                
                currentLocationMarker = new google.maps.Marker({
                    position: currentLocation,
                    map: map,
                    title: "Your Location",
                    icon: {
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        scaledSize: new google.maps.Size(32, 32)
                    }
                });
                
                document.getElementById('location-input').value = "Current Location";
                
                // Filter hospitals
                filterHospitals();
            },
            function(error) {
                alert("Unable to retrieve your location. Please enter it manually.");
                console.error("Geolocation error:", error);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser. Please enter your location manually.");
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        showMapError();
    } else {
        // Give it a small delay to ensure everything is ready
        setTimeout(initMap, 100);
    }
    
=======
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    let map = L.map('hospital-map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Sample hospital data (in a real app, this would come from an API)
    const hospitals = [
        
            {
                id: 1,
                name: "PSG Hospitals",
                address: "Peelamedu, Avinashi Road, Coimbatore - 641004",
                distance: 3.2,
                rating: 4.8,
                waitTime: 20,
                waitTimeLevel: "low",
                specialties: ["emergency", "cardiology", "neurology", "orthopedics"],
                phone: "+91 422 2570170",
                lat: 11.0186,
                lng: 77.0199
            },
            {
                id: 2,
                name: "Kovai Medical Center and Hospital (KMCH)",
                address: "Avanashi Road, Coimbatore - 641014",
                distance: 5.5,
                rating: 4.7,
                waitTime: 35,
                waitTimeLevel: "medium",
                specialties: ["emergency", "pediatrics", "oncology", "cardiology"],
                phone: "+91 422 4323800",
                lat: 11.0274,
                lng: 77.0262
            },
            {
                id: 3,
                name: "G. Kuppuswamy Naidu Memorial Hospital",
                address: "Pappanaickenpalayam, Coimbatore - 641037",
                distance: 4.1,
                rating: 4.5,
                waitTime: 45,
                waitTimeLevel: "medium",
                specialties: ["emergency", "general surgery", "urology", "ophthalmology"],
                phone: "+91 422 2245000",
                lat: 11.0025,
                lng: 77.0089
            },
            {
                id: 4,
                name: "Sri Ramakrishna Hospital",
                address: "395, Sarojini Naidu Road, Coimbatore - 641044",
                distance: 2.8,
                rating: 4.6,
                waitTime: 30,
                waitTimeLevel: "medium",
                specialties: ["emergency", "pediatrics", "dermatology", "ENT"],
                phone: "+91 422 4500000",
                lat: 11.0039,
                lng: 76.9618
            },
            {
                id: 5,
                name: "Aravind Eye Hospital",
                address: "Avanishi Road, Coimbatore - 641014",
                distance: 6.2,
                rating: 4.9,
                waitTime: 15,
                waitTimeLevel: "low",
                specialties: ["ophthalmology", "eye emergency"],
                phone: "+91 422 4365000",
                lat: 11.0356,
                lng: 77.0372
            }
        ];
    let markers = [];
    let currentLocation = null;

    // Function to display hospitals on the map and list
    function displayHospitals(filteredHospitals) {
        // Clear previous markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Clear hospital list
        const hospitalList = document.getElementById('hospital-list');
        hospitalList.innerHTML = '';
        
        // Add markers to map and create list items
        filteredHospitals.forEach(hospital => {
            // Create marker
            const marker = L.marker([hospital.lat, hospital.lng]).addTo(map)
                .bindPopup(`<b>${hospital.name}</b><br>${hospital.address}<br>Wait time: ${hospital.waitTime} mins`);
            markers.push(marker);
            
            // Create list item
            const hospitalCard = document.createElement('div');
            hospitalCard.className = 'hospital-card';
            hospitalCard.dataset.id = hospital.id;
            
            // Determine wait time class
            let waitTimeClass = '';
            if (hospital.waitTime <= 30) waitTimeClass = 'wait-time-low';
            else if (hospital.waitTime <= 60) waitTimeClass = 'wait-time-medium';
            else waitTimeClass = 'wait-time-high';
            
            hospitalCard.innerHTML = `
                <div class="hospital-header">
                    <div>
                        <h3 class="hospital-name">${hospital.name}</h3>
                        <div class="hospital-distance">
                            <i class="fas fa-location-arrow"></i> ${hospital.distance} km away
                        </div>
                    </div>
                    <div class="hospital-rating">
                        <i class="fas fa-star"></i> ${hospital.rating}
                    </div>
                </div>
                <div class="hospital-details">
                    <div class="hospital-detail">
                        <i class="fas fa-map-marker-alt"></i> ${hospital.address}
                    </div>
                    <div class="hospital-detail">
                        <i class="fas fa-phone"></i> ${hospital.phone}
                    </div>
                    <div class="hospital-detail">
                        <i class="fas fa-clock"></i> 
                        <span class="hospital-wait-time ${waitTimeClass}">
                            Wait time: ${hospital.waitTime} mins
                        </span>
                    </div>
                </div>
                <div class="hospital-actions">
                    <button class="btn-directions" data-id="${hospital.id}">
                        <i class="fas fa-directions"></i> Directions
                    </button>
                    <button class="btn-call" data-id="${hospital.id}">
                        <i class="fas fa-phone"></i> Call
                    </button>
                </div>
            `;
            
            hospitalList.appendChild(hospitalCard);
            
            // Add click event to center map on hospital
            hospitalCard.addEventListener('click', function() {
                map.setView([hospital.lat, hospital.lng], 15);
                marker.openPopup();
                
                // Highlight selected hospital
                document.querySelectorAll('.hospital-card').forEach(card => {
                    card.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
        
        // Fit map to show all markers
        if (filteredHospitals.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.2));
        }
    }

    // Function to filter hospitals based on user input
    function filterHospitals() {
        const specialty = document.getElementById('specialty-filter').value;
        const distance = parseInt(document.getElementById('distance-filter').value);
        const locationInput = document.getElementById('location-input').value.toLowerCase();
        
        let filtered = hospitals;
        
        // Filter by specialty
        if (specialty) {
            filtered = filtered.filter(hospital => 
                hospital.specialties.includes(specialty)
            );
        }
        
        // Filter by distance
        filtered = filtered.filter(hospital => 
            hospital.distance <= distance
        );
        
        // Filter by location search (if any)
        if (locationInput) {
            filtered = filtered.filter(hospital => 
                hospital.name.toLowerCase().includes(locationInput) || 
                hospital.address.toLowerCase().includes(locationInput)
            );
        }
        
        // Sort by active sort option
        const activeSort = document.querySelector('.sort-btn.active').dataset.sort;
        if (activeSort === 'distance') {
            filtered.sort((a, b) => a.distance - b.distance);
        } else if (activeSort === 'wait-time') {
            filtered.sort((a, b) => a.waitTime - b.waitTime);
        } else if (activeSort === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        }
        
        displayHospitals(filtered);
    }

>>>>>>> 5d1b107cead7d4d7be9f69cc60e2ebc42ae704d8
    // Event listeners
    document.getElementById('search-btn').addEventListener('click', filterHospitals);
    
    // Current location button
<<<<<<< HEAD
    document.getElementById('current-location-btn').addEventListener('click', getCurrentLocation);
=======
    document.getElementById('current-location-btn').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map.setView([currentLocation.lat, currentLocation.lng], 13);
                    document.getElementById('location-input').value = "Current Location";
                    
                    // In a real app, you would geocode this to an address or use it to calculate distances
                    // For our demo, we'll just filter the existing data
                    filterHospitals();
                },
                function(error) {
                    alert("Unable to retrieve your location. Please enter it manually.");
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser. Please enter your location manually.");
        }
    });
>>>>>>> 5d1b107cead7d4d7be9f69cc60e2ebc42ae704d8
    
    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.sort-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            filterHospitals();
        });
    });
    
    // Call button delegation
    document.getElementById('hospital-list').addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-call') || e.target.closest('.btn-call')) {
            const button = e.target.classList.contains('btn-call') ? e.target : e.target.closest('.btn-call');
            const hospitalId = parseInt(button.dataset.id);
            const hospital = hospitals.find(h => h.id === hospitalId);
            if (hospital) {
<<<<<<< HEAD
                window.location.href = `tel:${hospital.phone}`;
=======
                // In a real app, this would initiate a phone call
                alert(`Calling ${hospital.name} at ${hospital.phone}`);
>>>>>>> 5d1b107cead7d4d7be9f69cc60e2ebc42ae704d8
            }
        }
        
        if (e.target.classList.contains('btn-directions') || e.target.closest('.btn-directions')) {
            const button = e.target.classList.contains('btn-directions') ? e.target : e.target.closest('.btn-directions');
            const hospitalId = parseInt(button.dataset.id);
            const hospital = hospitals.find(h => h.id === hospitalId);
            if (hospital) {
<<<<<<< HEAD
                showDirections(hospital.lat, hospital.lng);
                highlightHospitalCard(hospital.id);
            }
        }
    });
});

// Global access for HTML callbacks
window.initMap = initMap;
window.showDirections = showDirections;
=======
                // In a real app, this would open Google Maps or Apple Maps with directions
                alert(`Opening directions to ${hospital.name} at ${hospital.address}`);
            }
        }
    });
    
    // Initial display of all hospitals
    filterHospitals();
});
>>>>>>> 5d1b107cead7d4d7be9f69cc60e2ebc42ae704d8
