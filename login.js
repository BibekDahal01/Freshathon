document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // 1. LOGIN FORM VALIDATION & SUBMISSION
    // =============================================
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Email validation
    emailInput.addEventListener('input', function() {
        if (!this.value) {
            emailError.textContent = '';
            return;
        }
        
        if (!validateEmail(this.value)) {
            emailError.textContent = 'Please enter a valid email address';
        } else {
            emailError.textContent = '';
        }
    });
    
    // Password validation
    passwordInput.addEventListener('input', function() {
        if (!this.value) {
            passwordError.textContent = '';
            return;
        }
        
        if (this.value.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters';
        } else {
            passwordError.textContent = '';
        }
    });
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate inputs
            let isValid = true;
            
            if (!emailInput.value) {
                emailError.textContent = 'Email is required';
                isValid = false;
            } else if (!validateEmail(emailInput.value)) {
                emailError.textContent = 'Please enter a valid email address';
                isValid = false;
            }
            
            if (!passwordInput.value) {
                passwordError.textContent = 'Password is required';
                isValid = false;
            } else if (passwordInput.value.length < 8) {
                passwordError.textContent = 'Password must be at least 8 characters';
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Simulate login process
            simulateLogin();
        });
    }
    
    function simulateLogin() {
        // Show loading state
        loginBtn.disabled = true;
        loginBtnText.textContent = 'Authenticating...';
        loginSpinner.classList.remove('hidden');
        
        // Simulate API call with timeout
        setTimeout(() => {
            // For demo purposes, we'll show the security modal
            // In a real app, you would check credentials first
            showSecurityModal(emailInput.value);
            
            // Reset button state (in real app, this would be after successful verification)
            loginBtn.disabled = false;
            loginBtnText.textContent = 'Sign In';
            loginSpinner.classList.add('hidden');
        }, 1500);
    }
    
    // =============================================
    // 2. SECURITY VERIFICATION MODAL
    // =============================================
    const securityModal = document.getElementById('securityModal');
    const verificationOptions = document.querySelectorAll('.verification-option');
    const verificationMethods = document.querySelectorAll('.verification-method');
    const userEmailSpan = document.getElementById('userEmail');
    const codeInputs = document.querySelectorAll('.code-input input');
    const verifyCodeBtn = document.getElementById('verifyCode');
    const verifyAuthCodeBtn = document.getElementById('verifyAuthCode');
    const resendCodeLink = document.getElementById('resendCode');
    
    function showSecurityModal(email) {
        userEmailSpan.textContent = email;
        securityModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus first code input
        if (codeInputs.length > 0) {
            codeInputs[0].focus();
        }
    }
    
    // Close modal
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === securityModal) {
            closeModal();
        }
    });
    
    function closeModal() {
        securityModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Switch verification methods
    verificationOptions.forEach(option => {
        option.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            
            // Update active option
            verificationOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding method
            verificationMethods.forEach(m => m.classList.add('hidden'));
            document.getElementById(`${method}Verification`).classList.remove('hidden');
            
            // Focus first code input
            const activeMethod = document.getElementById(`${method}Verification`);
            const inputs = activeMethod.querySelectorAll('.code-input input');
            if (inputs.length > 0) {
                inputs[0].focus();
            }
        });
    });
    
    // Handle code input navigation
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value.length === 1) {
                if (index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });
    
    // Verify code button
    if (verifyCodeBtn) {
        verifyCodeBtn.addEventListener('click', function() {
            const code = Array.from(codeInputs).map(input => input.value).join('');
            
            if (code.length !== 6) {
                showAlert('Please enter a complete 6-digit code', 'error');
                return;
            }
            
            // Simulate verification
            this.disabled = true;
            this.textContent = 'Verifying...';
            
            setTimeout(() => {
                // For demo, we'll assume it's successful
                showAlert('Verification successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }, 1000);
        });
    }
    
    // Verify authenticator code button
    if (verifyAuthCodeBtn) {
        verifyAuthCodeBtn.addEventListener('click', function() {
            const inputs = document.querySelectorAll('#authenticatorVerification .code-input input');
            const code = Array.from(inputs).map(input => input.value).join('');
            
            if (code.length !== 6) {
                showAlert('Please enter a complete 6-digit code', 'error');
                return;
            }
            
            // Simulate verification
            this.disabled = true;
            this.textContent = 'Verifying...';
            
            setTimeout(() => {
                // For demo, we'll assume it's successful
                showAlert('Verification successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }, 1000);
        });
    }
    
    // Resend code link
    if (resendCodeLink) {
        resendCodeLink.addEventListener('click', function(e) {
            e.preventDefault();
            showAlert('New verification code sent to your email', 'success');
        });
    }
    
    // =============================================
    // 3. SOCIAL LOGIN BUTTONS
    // =============================================
    const googleBtn = document.querySelector('.social-btn.google');
    const facebookBtn = document.querySelector('.social-btn.facebook');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            showAlert('Redirecting to Google login...', 'info');
            // In a real app, this would redirect to Google OAuth
        });
    }
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            showAlert('Redirecting to Facebook login...', 'info');
            // In a real app, this would redirect to Facebook OAuth
        });
    }
    
    // =============================================
    // HELPER FUNCTIONS
    // =============================================
    
    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Show alert message
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 
                             type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => alertDiv.remove(), 500);
        }, 3000);
    }
});