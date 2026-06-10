import React from 'react';
import { useParams, useNavigate, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import { tidApi } from '../../services/tid.js';
import { toast } from '../../helpers/alerts.js';
import { Spinner } from '../../components/components.jsx';
import { COLORS } from '../../components/theme.js';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function RegistrationProcessPage() {
const { id } = useParams();
const navigate = useNavigate();
const { session } = useRouteLoaderData('root');
const data = useLoaderData();
const cursos = data?.cursos || [];
const [loading, setLoading] = React.useState(false);

const curso = cursos.find(c => String(c.id) === String(id));

const handleConfirm = async () => {
    setLoading(true);
    try {
    await tidApi.createInscripcion({
        usuario_id: session.id,
        curso_id: curso.id,
        fecha: new Date().toISOString().split('T')[0],
    });
    toast.success(`¡Te inscribiste en "${curso.titulo}"!`);
    navigate('/registration-management/success', { state: { curso } });
    } catch (e) {
    toast.error(e.message || 'No se pudo completar la inscripción');
    } finally {
    setLoading(false);
    }
};

if (!curso) {
    return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3 style={{ color: COLORS.textMuted }}>Curso no encontrado</h3>
        <p>Verifica que la ruta sea correcta.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/course-catalog')}>
        Volver al catálogo
        </button>
    </div>
    );
}

return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
    <button
        className="btn btn-ghost"
        onClick={() => navigate('/course-catalog')}
        style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
    >
        <ArrowLeft size={18} /> Volver al catálogo
    </button>

    <div className="card" style={{ padding: '30px', textAlign: 'center', borderTop: '6px solid #2D6DF6' }}>
        <div style={{
        background: '#D5F5F8', width: '60px', height: '60px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
        }}>
        <BookOpen color="#2D6DF6" size={30} />
        </div>

        <h2 style={{ color: '#0033A0', marginBottom: '10px' }}>Confirmar Inscripción</h2>
        <p style={{ color: COLORS.textMuted, marginBottom: '25px' }}>
        Estás a un paso de comenzar el curso: <br />
        <strong style={{ color: '#181818', fontSize: '18px' }}>{curso.titulo}</strong>
        </p>

        <div style={{ background: '#F2F2F2', padding: '15px', borderRadius: '8px', marginBottom: '25px', textAlign: 'left' }}>
        <p style={{ fontSize: '14px', margin: '5px 0' }}><strong>Nivel:</strong> {curso.nivel}</p>
        <p style={{ fontSize: '14px', margin: '5px 0' }}><strong>Categoría:</strong> {curso.categoria || 'Sin categoría'}</p>
        <p style={{ fontSize: '14px', margin: '5px 0' }}><strong>Instructor:</strong> {curso.instructor}</p>
        <p style={{ fontSize: '14px', margin: '5px 0' }}><strong>Duración:</strong> {curso.duracion}</p>
        </div>

        <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '12px', background: '#2D6DF6' }}
        onClick={handleConfirm}
        disabled={loading}
        >
        {loading ? <Spinner sm /> : 'Confirmar y Empezar'}
        </button>
    </div>
    </div>
);
}