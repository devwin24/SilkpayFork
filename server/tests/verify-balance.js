const app = require('../src/app');
const request = require('supertest');
const mongoose = require('mongoose');

// Connect to DB if not connected (app.js might not connect automatically if just imported?)
// Actually app.js imports config/database which calls connectDB.
// But we need to wait for connection.
// Instead, let's use the same approach as api-test.js: fetch against running server.

const API_BASE_URL = 'http://localhost:3001/api';

async function testBalanceSync() {
    console.log('Testing Balance Sync...');
    
    // Login first
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@silkpay.local', password: 'password123' })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.success) {
        console.error('Login failed');
        return;
    }
    
    const token = loginData.data.token;
    
    // Sync Balance
    try {
        const res = await fetch(`${API_BASE_URL}/balance/sync`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('✅ Balance Sync Passed!');
        } else {
            console.log('❌ Balance Sync Failed');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

testBalanceSync();
