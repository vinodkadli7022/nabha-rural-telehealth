import { db } from '@/db';
import { appointments } from '@/db/schema';

async function main() {
    const sampleAppointments = [
        {
            patientId: 1,
            doctorName: 'Dr. Rajesh Kumar',
            scheduledFor: '2024-04-25T10:00:00.000Z',
            status: 'scheduled',
            createdAt: new Date('2024-04-01T10:35:00.000Z').toISOString(),
        },
        {
            patientId: 2,
            doctorName: 'Dr. Priya Sharma',
            scheduledFor: '2024-04-27T14:30:00.000Z',
            status: 'scheduled',
            createdAt: new Date('2024-04-01T11:20:00.000Z').toISOString(),
        },
        {
            patientId: 3,
            doctorName: 'Dr. Amarjeet Singh',
            scheduledFor: '2024-04-22T09:00:00.000Z',
            status: 'completed',
            createdAt: new Date('2024-04-02T08:45:00.000Z').toISOString(),
        },
        {
            patientId: null,
            doctorName: 'Dr. Neha Gupta',
            scheduledFor: '2024-04-26T16:00:00.000Z',
            status: 'scheduled',
            createdAt: new Date('2024-04-02T14:30:00.000Z').toISOString(),
        },
        {
            patientId: 4,
            doctorName: 'Dr. Rajesh Kumar',
            scheduledFor: '2024-04-28T11:00:00.000Z',
            status: 'cancelled',
            createdAt: new Date('2024-04-05T10:25:00.000Z').toISOString(),
        },
        {
            patientId: null,
            customerName: 'Seeta Kumal',
            doctorName: 'Dr. Harpreet Kaur',
            scheduledFor: '2024-04-24T18:30:00.000Z',
            status: 'scheduled',
            createdAt: new Date('2003-04-05T18:45:00.000Z').toISOString(),
        },
        {
            patientId: 5,
            doctorName: 'Dr. Priya Sharma',
            scheduledFor: '2024-04-23T10:30:00.000Z',
            status: 'completed',
            createdAt: new Date('styles.04.06T09:IdI`kVWV k nsize2020: style="font-family:Arial,sans-serif;">