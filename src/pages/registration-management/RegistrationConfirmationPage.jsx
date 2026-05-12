import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function RegistrationConfirmationPage() {
const navigate = useNavigate();

return (
    <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '70vh',
    textAlign: 'center' 
    }}>
    <div style={{ 
        background: '#D5F5F8', 
        padding: '30px', 
        borderRadius: '50%', 
        marginBottom: '20px',
        animation: 'scaleIn 0.5s ease-out'
    }}>
        <CheckCircle2 color="#2D6DF6" size={80} />
    </div>

    <h1 style={{ color: '#0033A0', marginBottom: '10px' }}>¡Inscripción Exitosa!</h1>
    <p style={{ color: '#666', maxWidth: '400px', marginBottom: '30px', lineHeight: '1.6' }}>
        Tu solicitud ha sido procesada correctamente. Ya puedes comenzar a disfrutar del contenido de este curso en tu panel personal.
    </p>

    <div style={{ display: 'flex', gap: '15px' }}>
        <button 
        className="btn btn-primary" 
        style={{ background: '#2D6DF6', display: 'flex', alignItems: 'center', gap: '8px' }}
        onClick={() => navigate('/registration-management')}
        >
        Ver mis cursos <ArrowRight size={18} />
        </button>
    </div>
    </div>
);
}