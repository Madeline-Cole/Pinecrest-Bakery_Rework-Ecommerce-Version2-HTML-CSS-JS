import { initializeDatabase, findUser, addUser, userExists } from '/data/userDatabase.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeDatabase();

    // Tab switching functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const forms = document.querySelectorAll('.auth-form');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all tabs and forms
        tabBtns.forEach(b => b.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding form
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}Form`).classList.add('active');
    });
});

    // Sign In form handler
    document.getElementById('signinForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;
        
        const user = findUser(email, password);
        
        if (user) {
            showMessage(`Welcome back, ${user.name}!`, 'success');
            setTimeout(() => {
                window.location.href = '/pages/order-history.html';
            }, 1500);
        } else {
            showMessage('User not found. Redirecting to sign up...', 'error');
            setTimeout(() => {
                document.querySelector('[data-tab="signup"]').click();
            }, 2000);
        }
    });

    // Sign Up form handler
    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const name = document.getElementById('signupName').value;

        if (userExists(email)) {
            showMessage('Email already registered. Please sign in.', 'error');
            setTimeout(() => {
                document.querySelector('[data-tab="signin"]').click();
            }, 2000);
            return;
        }

        addUser({ email, password, name });
        showMessage('Registration successful! Please sign in.', 'success');
        setTimeout(() => {
            document.querySelector('[data-tab="signin"]').click();
        }, 1500);
    });
});

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = message;
    
    const form = document.querySelector('.auth-form.active');
    form.insertBefore(messageDiv, form.firstChild);
    
    setTimeout(() => messageDiv.remove(), 3000);
}