document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
    });
    
    // Form submission
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simple validation
        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // Here you would normally make an API call
        // For demo, we'll simulate a successful login
        simulateLogin(email, password);
    });
    
    // Social login buttons
    document.querySelector('.btn-social.google').addEventListener('click', function() {
        showMessage('Google login would be implemented here', 'info');
    });
    
    document.querySelector('.btn-social.facebook').addEventListener('click', function() {
        showMessage('Facebook login would be implemented here', 'info');
    });
    
    // Simulate login (replace with actual API call)
    function simulateLogin(email, password) {
        showMessage('Logging in...', 'info');
        
        // Simulate API call delay
        setTimeout(() => {
            // Demo validation - in real app, check against your backend
            if (email.includes('@') && password.length >= 6) {
                showMessage('Login successful! Redirecting...', 'success');
                
                // Store login state (in real app, you'd use proper auth)
                localStorage.setItem('healthGuardianLoggedIn', 'true');
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage('Invalid email or password', 'error');
            }
        }, 1000);
    }
    
    // Show status messages
    function showMessage(message, type) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // Insert after the form
        loginForm.insertAdjacentElement('afterend', messageDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
    
    // Check if already logged in
    if (localStorage.getItem('healthGuardianLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }
});