// Authentication handler
export class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    signUp(email, password, name) {
        const userExists = this.users.find(user => user.email === email);
        if (userExists) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = {
            id: Date.now(),
            email,
            password, // In production, use proper password hashing
            name,
            orderHistory: []
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        return { success: true, message: 'Registration successful' };
    }

    signIn(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    signOut() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateOrderHistory(order) {
        if (!this.currentUser) return;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        this.users[userIndex].orderHistory.unshift(order);
        this.currentUser = this.users[userIndex];
        
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
}
