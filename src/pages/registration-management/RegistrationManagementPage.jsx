import React from 'react';
import { useLoaderData, useRevalidator, useRouteLoaderData, useNavigate } from 'react-router-dom';
import { EmptyState, Spinner } from '../../components/components.jsx';
import { COLORS } from '../../components/theme.js';
import { confirm, toast } from '../../helpers/alerts.js';
import { tidApi } from '../../services/tid.js';
import { ClipboardList, RefreshCw, Trash2, CheckCircle, Clock, BookOpen, Plus } from 'lucide-react';

export default function RegistrationManagementPage() {
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const { session } = useRouteLoaderData('root');
  const { cursos, inscripciones } = useLoaderData();

  const [search, setSearch] = React.useState('');

  const SURA_COLORS = {
    azulVivo: '#2D6DF6',
    azulSura: '#0033A0',
    aqua: '#D5F5F8',
    gris: '#F2F2F2'
  };

  const cursoById = React.useMemo(() => {
    const m = new Map();
    cursos.forEach((c) => m.set(c.id, c));
    return m;
  }, [cursos]);

  const filteredInscripciones = React.useMemo(() => {
    return inscripciones.filter(i => {
      const curso = cursoById.get(i.curso_id);
      return curso?.titulo.toLowerCase().includes(search.toLowerCase());
    });
  }, [inscripciones, search, cursoById]);

  const stats = React.useMemo(() => {686
    return {
      total: inscripciones.length,
      enProgreso: inscripciones.filter(i => (i.progreso || 0) > 0 && (i.progreso || 0) < 100).length,
      completados: inscripciones.filter(i => (i.progreso || 0) >= 100).length
    };
  }, [inscripciones]);

  const handleCancel = async (insc) => {
    const curso = cursoById.get(insc.curso_id);
    const ok = await confirm({
      title: 'Cancelar inscripción',
      message: curso ? `Curso: ${curso.titulo}` : '¿Deseas cancelar esta inscripción?',
      okText: 'Cancelar inscripción',
      cancelText: 'Volver',
      color: COLORS.danger,
    });
    if (!ok) return;
    await tidApi.deleteInscripcion(insc.id);
    toast.success('Inscripción cancelada');
    revalidator.revalidate();
  };

  if (revalidator.state !== 'idle') return <Spinner text="Actualizando..." />;

  if (!inscripciones?.length) {
    return <EmptyState icon={<ClipboardList size={44} color={COLORS.textMuted} />} title="Sin inscripciones" subtitle="Aún no tienes inscripciones registradas" />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h2 style={{ color: SURA_COLORS.azulSura }}>Mis Cursos</h2>
          <p>Bienvenido, {session.nombre}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
        <button 
        className="btn btn-primary" 
        onClick={() => navigate('/course-catalog')}
        style={{ background: SURA_COLORS.azulVivo, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
        <Plus size={16} /> Inscribirse en un curso
        </button>
          
          <button className="btn btn-secondary" onClick={() => revalidator.revalidate()}>
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderLeft: `5px solid ${SURA_COLORS.azulSura}` }}>
          <div style={{ background: '#E6EEFF', padding: '10px', borderRadius: '8px' }}>
            <BookOpen color={SURA_COLORS.azulSura} size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: COLORS.textMuted }}>Total Inscritos</p>
            <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.total}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderLeft: `5px solid ${SURA_COLORS.azulVivo}` }}>
          <div style={{ background: '#EAF2FF', padding: '10px', borderRadius: '8px' }}>
            <Clock color={SURA_COLORS.azulVivo} size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: COLORS.textMuted }}>En Progreso</p>
            <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.enProgreso}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderLeft: `5px solid #00C389` }}>
          <div style={{ background: '#E6FFF7', padding: '10px', borderRadius: '8px' }}>
            <CheckCircle color="#00C389" size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: COLORS.textMuted }}>Completados</p>
            <h3 style={{ margin: 0, fontSize: '24px' }}>{stats.completados}</h3>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          className="form-control"
          placeholder="Buscar curso por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: `1px solid ${SURA_COLORS.azulVivo}`, borderRadius: '8px' }}
        />
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Fecha de Inscripción</th>
              <th>Estado</th>
              <th>Progreso</th>
              <th style={{ width: 1 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredInscripciones.map((i) => {
              const curso = cursoById.get(i.curso_id);
              return (
                <tr key={i.id}>
                  <td style={{ fontWeight: 700 }}>{curso?.titulo || 'Curso'}</td>
                  <td style={{ color: COLORS.textMuted }}>{i.fecha}</td>
                  <td>
                    <span className={`badge ${i.estado === 'Completado' ? 'badge-green' : 'badge-blue'}`}>{i.estado}</span>
                  </td>
                  <td style={{ minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar-bg" style={{ flex: 1 }}>
                        <div 
                          className="progress-bar-fill" 
                          style={{ 
                            width: `${i.progreso || 0}%`, 
                            background: (i.progreso || 0) >= 100 ? '#00C389' : SURA_COLORS.azulVivo 
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: 12, color: COLORS.textMuted }}>{i.progreso || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(i)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}