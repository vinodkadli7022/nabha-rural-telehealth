import { db } from '@/db';
import { patients } from '@/db/schema';

async function main() {
    const samplePatients = [
        {
            name: 'Simran Kaur',
            gender: 'female',
            age: 32,
            village: 'Bhadson',
            phone: '+91-9812345670',
            createdAt: new Date('2024-10-15').toISOString(),
        },
        {
            name: 'Rajesh Singh',
            gender: 'male',
            age: 45,
            village: 'Gobindpura',
            phone: '+91-9812345671',
            createdAt: new Date('2024-10-20').toISOString(),
        },
        {
            name: 'Gurpreet Kaur',
            gender: 'female',
            age: 28,
            village: 'Kheri',
            phone: '+91-9812345672',
            createdAt: new Date('2024-11-01').toISOString(),
        },
        {
            name: 'Harjeet Singh',
            gender: 'male',
            age: 67,
            village: 'Nabha',
            phone: '+91-9812345673',
            createdAt: new Date('2024-11-10').toISOString(),
        },
        {
            name: 'Amrita Singh',
            gender: 'female',
            age: 39,
            village: 'Patiala',
            phone: '+91-9812345674',
            createdAt: new Date('2024-11-15').toISOString(),
        },
        {
            name: 'Balwinder Kaur',
            gender: 'female',
            age: 52,
            village: 'Samana',
            phone: '+91-9812345675',
            createdAt: new Date('2024-11-25').toISOString(),
        },
        {
            name: 'Jagdeep Singh',
            gender: 'male',
            age: 41,
            village: 'Dhuri',
            phone: '+91-9812345676',
            createdAt: new Date('2024-12-01').toISOString(),
        },
        {
            name: 'Parminder Kaur',
            gender: 'female',
            age: 29,
            village: 'Rajpura',
            phone: '+91-9812345677',
            createdAt: new Date('2024-12-05').toISOString(),
        },
    ];

    await db.insert(patients).values(samplePatients);
    
    console.log('✅ Patients seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});