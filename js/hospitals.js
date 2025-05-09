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

    // Event listeners
    document.getElementById('search-btn').addEventListener('click', filterHospitals);
    
    // Current location button
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
                // In a real app, this would initiate a phone call
                alert(`Calling ${hospital.name} at ${hospital.phone}`);
            }
        }
        
        if (e.target.classList.contains('btn-directions') || e.target.closest('.btn-directions')) {
            const button = e.target.classList.contains('btn-directions') ? e.target : e.target.closest('.btn-directions');
            const hospitalId = parseInt(button.dataset.id);
            const hospital = hospitals.find(h => h.id === hospitalId);
            if (hospital) {
                // In a real app, this would open Google Maps or Apple Maps with directions
                alert(`Opening directions to ${hospital.name} at ${hospital.address}`);
            }
        }
    });
    
    // Initial display of all hospitals
    filterHospitals();
});