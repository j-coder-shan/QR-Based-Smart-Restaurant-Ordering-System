import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import api from '../services/api';
import Loader from '../components/Loader';

const ScanHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { startSession } = useSession();
    const [error, setError] = useState(null);

    useEffect(() => {
        const tableNumber = searchParams.get('table');
        const qrToken = searchParams.get('token');

        if (tableNumber && qrToken) {
            const verifyAndStart = async () => {
                try {
                    const response = await api.post('/api/scan', { tableNumber, qrToken });
                    startSession(response.data.session_id, response.data.table_number, response.data.restaurant_name);
                    navigate('/menu');
                } catch (err) {
                    setError('Invalid QR Code');
                    navigate('/error');
                }
            };
            verifyAndStart();
        } else {
            navigate('/error');
        }
    }, [searchParams, startSession, navigate]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader />
        </div>
    );
};

export default ScanHandler;
