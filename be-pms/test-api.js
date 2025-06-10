// Test API endpoints
const baseURL = 'http://localhost:5000/api/v1';

// Test register
async function testRegister() {
    try {
        const response = await fetch(`${baseURL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'developer'
            })
        });

        const data = await response.json();
        console.log('Register response:', data);
        return data;
    } catch (error) {
        console.error('Register error:', error);
    }
}

// Test login
async function testLogin() {
    try {
        const response = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();
        console.log('Login response:', data);
        return data;
    } catch (error) {
        console.error('Login error:', error);
    }
}

// Run tests
async function runTests() {
    console.log('Testing API endpoints...\n');

    console.log('1. Testing Register endpoint:');
    await testRegister();

    console.log('\n2. Testing Login endpoint:');
    await testLogin();
}

// Check if server is running
fetch('http://localhost:5000')
    .then(res => res.text())
    .then(text => {
        console.log('Server status:', text);
        console.log('\nStarting API tests...\n');
        runTests();
    })
    .catch(err => {
        console.error('Server is not running!');
        console.error('Please run: npm run dev');
    }); 