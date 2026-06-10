import React from 'react';
import { useLoaderData, useRevalidator, useRouteLoaderData, useNavigate } from 'react-router-dom';
import { EmptyState, Modal, Spinner } from '../../components/components.jsx';
import { COLORS } from '../../components/theme.js';
import { confirm, toast } from '../../helpers/alerts.js';
import { tidApi } from '../../services/tid.js';
import { ClipboardList, RefreshCw, Trash2, CheckCircle, Clock, BookOpen, Plus, Pencil, Search, X } from 'lucide-react';

export default function RegistrationManagementPage() {
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const { session } = useRouteLoaderData('root');
  const { cursos, inscripciones } = useLoaderData();

  const [search, setSearch] = React.useState('');
  const [filtroEstado, setFiltroEstado] = React.useState('Todos');

  const [modalEdit, setModalEdit] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ progreso: 0, estado: 'Activo' });
  const [saving, setSaving] = React.useState(false);
  const [modalCancel, setModalCancel] = React.useState(null);
  const [canceling, setCanceling] = React.useState(false);

  const SURA_COLORS = {
    azulVivo: '#2D6DF6',
    azulSura: '#0033A0',
    aqua: '#D5F5F8',
    gris: '#F2F2F2'
  };

  const openEdit = (insc) => {
    setEditForm({ progreso: insc.progreso || 0, estado: insc.estado || 'Activo' });
    setModalEdit(insc);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await tidApi.updateInscripcion(modalEdit.id, {
        ...modalEdit,
        progreso: parseInt(editForm.progreso),
        estado: editForm.estado,
      });
      toast.success('Inscripción actualizada');
      setModalEdit(null);
      revalidator.revalidate();
    } catch (e) {
      toast.error(e.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const cursoById = React.useMemo(() => {
    const m = new Map();
    cursos.forEach((c) => m.set(c.id, c));
    return m;
  }, [cursos]);

  const filteredInscripciones = React.useMemo(() => {
  return inscripciones.filter(i => {
    const curso = cursoById.get(i.curso_id);
    const coincideBusqueda = curso?.titulo.toLowerCase().includes(search.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos' || i.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });
}, [inscripciones, search, filtroEstado, cursoById]);

  const stats = React.useMemo(() => {
    return {
      total: inscripciones.length,
      enProgreso: inscripciones.filter(i => (i.progreso || 0) > 0 && (i.progreso || 0) < 100).length,
      completados: inscripciones.filter(i => (i.progreso || 0) >= 100).length
    };
  }, [inscripciones]);

  const handleCancel = (insc) => {
    setModalCancel(insc);
  };

  const confirmCancel = async () => {
    if (!modalCancel) return;
    setCanceling(true);
    try {
      await tidApi.deleteInscripcion(modalCancel.id);
      toast.success('Inscripción cancelada');
      setModalCancel(null);
      revalidator.revalidate();
    } catch (e) {
      toast.error(e.message || 'No se pudo cancelar la inscripción');
    } finally {
      setCanceling(false);
    }
  };

  if (revalidator.state !== 'idle') return <Spinner text="Actualizando..." />;

  if (!inscripciones?.length) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{
        background: '#E6EEFF', width: '80px', height: '80px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
      }}>
        <ClipboardList size={40} color={SURA_COLORS.azulSura} />
      </div>
      <h3 style={{ color: SURA_COLORS.azulSura, marginBottom: '10px' }}>
        Sin inscripciones
      </h3>
      <p style={{ color: COLORS.textMuted, marginBottom: '30px', maxWidth: '360px', margin: '0 auto 30px' }}>
        Aún no tienes cursos registrados. Explora el catálogo y empieza a aprender hoy.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => navigate('/course-catalog')}
        style={{ background: SURA_COLORS.azulVivo, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <BookOpen size={16} /> Explorar catálogo
      </button>
    </div>
  );
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

      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
  
      <div className="search-box">
  <Search size={16} color={COLORS.textMuted} />
  <input
    placeholder="Buscar curso por nombre..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
  {search && (
    <button
      onClick={() => setSearch('')}
      style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}
    >
      <X size={16} />
    </button>
  )}
</div>

  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    {['Todos', 'Activo', 'En Progreso', 'Completado'].map((estado) => {
      const activo = filtroEstado === estado;
      const colores = {
        'Todos':       { bg: '#0033A0', text: '#fff' },
        'Activo':      { bg: '#2D6DF6', text: '#fff' },
        'En Progreso': { bg: '#f59e0b', text: '#fff' },
        'Completado':  { bg: '#00C389', text: '#fff' },
      };
      return (
        <button
          key={estado}
          onClick={() => setFiltroEstado(estado)}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: `2px solid ${colores[estado].bg}`,
            background: activo ? colores[estado].bg : 'transparent',
            color: activo ? colores[estado].text : colores[estado].bg,
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {estado}
          {estado !== 'Todos' && (
            <span style={{
              marginLeft: '6px',
              background: activo ? 'rgba(255,255,255,0.3)' : colores[estado].bg,
              color: activo ? colores[estado].text : '#fff',
              borderRadius: '10px',
              padding: '1px 7px',
              fontSize: '11px',
            }}>
              {inscripciones.filter(i => i.estado === estado).length}
            </span>
          )}
        </button>
      );
    })}
  </div>
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
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: i.estado === 'Completado' ? '#d1fae5' : i.estado === 'En Progreso' ? '#fef3c7' : '#dbeafe',
                      color:      i.estado === 'Completado' ? '#065f46' : i.estado === 'En Progreso' ? '#92400e' : '#1e40af',
                    }}>
                    {i.estado}
                  </span>
                  </td>
                  <td style={{ minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar-bg" style={{ flex: 1 }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${i.progreso || 0}%`,
                            background: (i.progreso || 0) >= 100 ? '#00C389' : i.estado === 'En Progreso' ? '#f59e0b' : SURA_COLORS.azulVivo
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: 12, color: COLORS.textMuted }}>{i.progreso || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(i)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(i)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!modalEdit}
        onClose={() => setModalEdit(null)}
        title={`Editar — ${cursoById.get(modalEdit?.curso_id)?.titulo || ''}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalEdit(null)}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpdate}
              disabled={saving}
              style={{ background: SURA_COLORS.azulVivo }}
            >
              {saving ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }}></div> : 'Guardar cambios'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Estado
            </label>
            <select
              className="form-input"
              value={editForm.estado}
              onChange={(e) => setEditForm(p => ({ ...p, estado: e.target.value }))}
            >
              <option value="Activo">Activo</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completado">Completado</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Progreso: <span style={{ color: SURA_COLORS.azulVivo }}>{editForm.progreso}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={editForm.progreso}
              onChange={(e) => setEditForm(p => ({ ...p, progreso: e.target.value }))}
              style={{ width: '100%', accentColor: SURA_COLORS.azulVivo }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999' }}>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmación de Cancelación */}
      <Modal
        open={!!modalCancel}
        onClose={() => setModalCancel(null)}
        title="Cancelar Inscripción"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalCancel(null)} disabled={canceling}>
              Volver
            </button>
            <button
              className="btn btn-danger"
              onClick={confirmCancel}
              disabled={canceling}
            >
              {canceling ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }}></div> : 'Confirmar cancelación'}
            </button>
          </>
        }
      >
        {modalCancel && (() => {
          const curso = cursoById.get(modalCancel.curso_id);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                background: '#FEE2E2', width: '60px', height: '60px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
              }}>
                <Trash2 color={COLORS.danger} size={30} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: COLORS.textPrimary, marginBottom: '8px' }}>
                  ¿Estás seguro de cancelar tu inscripción?
                </h3>
                <p style={{ color: COLORS.textSecondary, fontSize: '14px', lineHeight: '1.5' }}>
                  Perderás el progreso actual del curso y tu cupo será liberado para otros estudiantes.
                </p>
              </div>
              {curso && (
                <div style={{ background: COLORS.surface2, borderRadius: '8px', padding: '12px 16px', textAlign: 'left', borderLeft: `4px solid ${COLORS.danger}` }}>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>Curso a cancelar:</div>
                  <div style={{ fontWeight: 600, color: COLORS.textPrimary, fontSize: '15px' }}>{curso.titulo}</div>
                  <div style={{ fontSize: '12px', color: COLORS.textSecondary, marginTop: '4px' }}>
                    Instructor: {curso.instructor} · Progreso: {modalCancel.progreso || 0}%
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}