export const initialUsers = [
    {
        email: "test@email.com",
        password: "password123",
        name: "Test User"
    },
    {
        email: "john@email.com",
        password: "john123",
        name: "John Doe"
    }
];

export function initializeDatabase() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
}

export function addUser(user) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
}

export function findUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(user => user.email === email && user.password === password);
}

export function userExists(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.some(user => user.email === email);
}
