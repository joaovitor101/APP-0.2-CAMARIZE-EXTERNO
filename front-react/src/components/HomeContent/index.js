import { useRouter } from "next/router";
import styles from "./HomeContent.module.css";
import NavBottom from "../NavBottom";
import AuthError from "../AuthError";
import Loading from "../Loading";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Notification from "../Notification";
import Modal from '../Modal';
import GuidedTour from "../GuidedTour";

export default function HomeContent() {
  const router = useRouter();
  const [cativeiros, setCativeiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [cativeiroToDelete, setCativeiroToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showTour, setShowTour] = useState(false);

  // Refs para o tour
  const infoRef = useRef(null);
  const statusRef = useRef(null);
  const sensoresRef = useRef(null);
  const addRef = useRef(null);
  const downloadRef = useRef(null);
  const firstCativeiroRef = useRef(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    async function fetchCativeiros() {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        if (!token) {
          setError('Você precisa estar logado para acessar esta página');
          setLoading(false);
          return;
        }
        
        const res = await axios.get(`${apiUrl}/cativeiros`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCativeiros(res.data);
      } catch (err) {
        console.error('Erro ao buscar cativeiros:', err);
        if (err.response?.status === 401) {
          setError('Sessão expirada. Faça login novamente para continuar.');
        } else {
          setError('Erro ao carregar os dados. Tente novamente.');
        }
        setCativeiros([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCativeiros();
  }, []);

  const handleCativeiroClick = (id) => {
    router.push(`/dashboard?id=${id}`);
  };

  const handleEditCativeiro = (e, id) => {
    e.stopPropagation();
    router.push(`/edit-cativeiro?id=${id}`);
  };

  const handleDeleteCativeiro = async (e, id) => {
    e.stopPropagation();
    setCativeiroToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!cativeiroToDelete) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await axios.delete(`${apiUrl}/cativeiros/${cativeiroToDelete}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      // Recarregar a lista de cativeiros
      const res = await axios.get(`${apiUrl}/cativeiros`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setCativeiros(res.data);
      
      setShowDeleteModal(false);
      setCativeiroToDelete(null);
      showNotification('Cativeiro excluído com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao deletar cativeiro:', err);
      showNotification('Erro ao excluir cativeiro', 'error');
      setShowDeleteModal(false);
      setCativeiroToDelete(null);
    }
  };

  const handleDownloadClick = () => {
    setShowPeriodoModal(true);
  };
  
  const handlePeriodoSelect = (periodo) => {
    setShowPeriodoModal(false);
    router.push(`/rel-geral?periodo=${periodo}`);
  };

  // Mostrar tour apenas na primeira vez
  useEffect(() => {
    try {
      // Usa um identificador por usuário para o tour
      const getCurrentUserId = () => {
        try {
          const raw = localStorage.getItem('usuarioCamarize');
          if (!raw) return null;
          const user = JSON.parse(raw);
          return user?._id || user?.id || user?.userId || null;
        } catch {
          return null;
        }
      };

      const userId = getCurrentUserId();
      const tourKey = userId ? `camarize_home_tour_done_${userId}` : 'camarize_home_tour_done';
      const done = localStorage.getItem(tourKey);
      if (!done) {
        // pequeno delay para garantir refs montadas
        const t = setTimeout(() => setShowTour(true), 250);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  // Se há erro, mostrar tela de erro
  if (error) {
    return <AuthError error={error} onRetry={() => window.location.reload()} />;
  }

  // Se está carregando, mostrar loading
  if (loading) {
    return <Loading message="Carregando..." />;
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className={styles.iconBtn} 
              aria-label="Informações sobre a aplicação"
              onClick={() => setShowInfoModal(true)}
              style={{ padding: '4px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}
              ref={infoRef}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                <path d="M12 16V12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="8" r="1" fill="#3B82F6"/>
              </svg>
            </button>
          </div>

          <div className={styles.iconGroup}>
            <button
              className={styles.iconBtn}
              aria-label="Status dos Cativeiros"
              onClick={() => router.push('/status-cativeiros')}
              style={{ position: 'relative' }}
              ref={statusRef}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="#222" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <button className={styles.iconBtn} aria-label="Sensor" onClick={() => router.push('/sensores')} ref={sensoresRef}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="7" y="7" width="10" height="10" rx="2" fill="#000"/>
                <rect x="9" y="9" width="6" height="6" rx="1" fill="#fff"/>
                <rect x="2" y="11" width="3" height="2" rx="1" fill="#000"/>
                <rect x="19" y="11" width="3" height="2" rx="1" fill="#000"/>
                <rect x="11" y="2" width="2" height="3" rx="1" fill="#000"/>
                <rect x="11" y="19" width="2" height="3" rx="1" fill="#000"/>
                <rect x="4.22" y="4.22" width="2" height="3" rx="1" transform="rotate(-45 4.22 4.22)" fill="#000"/>
                <rect x="17.78" y="16.78" width="2" height="3" rx="1" transform="rotate(-45 17.78 16.78)" fill="#000"/>
                <rect x="4.22" y="16.78" width="2" height="3" rx="1" transform="rotate(45 4.22 16.78)" fill="#000"/>
                <rect x="17.78" y="4.22" width="2" height="3" rx="1" transform="rotate(45 17.78 4.22)" fill="#000"/>
              </svg>
            </button>
            <button
              className={styles.iconBtn}
              aria-label="Cadastrar Cativeiro"
              onClick={() => router.push('/create-cativeiros')}
              ref={addRef}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#222" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="#222" strokeWidth="2"/></svg>
            </button>
            <button className={styles.iconBtn} aria-label="Download" onClick={handleDownloadClick} ref={downloadRef}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="#222" strokeWidth="2"/><rect x="4" y="18" width="16" height="2" rx="1" fill="#222"/></svg>
            </button>
          </div>
        </div>



      <div className={styles.cativeiroList}>
        {cativeiros.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyMessage}>Sem cativeiros cadastrados</div>
          </div>
        ) : (
          cativeiros.map((cativeiro, idx) => {
            // Converter buffer para base64 se existir (sem depender de Buffer do Node)
            let fotoUrl = "/images/cativeiro1.jpg";
            if (cativeiro.foto_cativeiro && cativeiro.foto_cativeiro.data) {
              try {
                const bytes = new Uint8Array(cativeiro.foto_cativeiro.data);
                let binary = "";
                for (let i = 0; i < bytes.byteLength; i += 1) {
                  binary += String.fromCharCode(bytes[i]);
                }
                const base64String = typeof window !== 'undefined' ? window.btoa(binary) : "";
                if (base64String) {
                  fotoUrl = `data:image/jpeg;base64,${base64String}`;
                }
              } catch (e) {
                // mantém imagem padrão
              }
            }
            return (
              <div
                key={cativeiro._id}
                className={styles.cativeiroItem}
                style={{ cursor: "pointer" }}
                onClick={() => handleCativeiroClick(cativeiro._id)}
                ref={idx === 0 ? firstCativeiroRef : null}
              >
                <img
                  src={fotoUrl}
                  alt={`Cativeiro ${idx + 1}`}
                  className={styles.cativeiroImg}
                />
                <div className={styles.cativeiroInfo}>
                  <div className={styles.cativeiroNome}>{cativeiro.nome || `Cativeiro ${idx + 1}`}</div>
                  <div className={styles.cativeiroCultivo}>{
                    (typeof cativeiro.id_tipo_camarao === 'object' && cativeiro.id_tipo_camarao?.nome)
                      ? cativeiro.id_tipo_camarao.nome
                      : (cativeiro.id_tipo_camarao || 'Tipo não informado')
                  }</div>
                </div>
                
                <div className={styles.cativeiroActions}>
                  <button 
                    className={styles.actionBtn} 
                    onClick={(e) => handleEditCativeiro(e, cativeiro._id)}
                    title="Editar"
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path d="M15.232 5.232a3 3 0 1 1 4.243 4.243L7.5 21H3v-4.5l12.232-12.268Z" stroke="#7ecbff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    className={styles.actionBtn} 
                    onClick={(e) => handleDeleteCativeiro(e, cativeiro._id)}
                    title="Excluir"
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>
      
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 24px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        maxWidth: 600,
        width: '100%',
        margin: '0 auto'
      }}>
        <img src="/images/logo_camarize1.png" alt="Logo" style={{ height: 24 }} />
      </div>
      
      <NavBottom />

      {/* Tour guiado - somente na primeira visita */}
      {showTour && (
        <GuidedTour
          steps={
            [
              { ref: infoRef, title: 'Informações', content: 'Saiba o que é o Camarize e por que monitoramos temperatura, pH e amônia.' },
              { ref: statusRef, title: 'Status dos cativeiros', content: 'Veja rapidamente se algum cativeiro precisa de atenção agora.' },
              ...(cativeiros.length > 0 ? [{ ref: firstCativeiroRef, title: 'Cativeiro', content: 'Toque no cativeiro para abrir o dashboard com dados em tempo real.' }] : []),
              { ref: sensoresRef, title: 'Sensores', content: 'Gerencie sensores instalados e verifique o funcionamento.' },
              { ref: addRef, title: 'Adicionar cativeiro', content: 'Cadastre um novo cativeiro para começar a monitorar.' },
              { ref: downloadRef, title: 'Relatórios', content: 'Baixe relatórios com os principais indicadores por período.' },
            ].filter(s => s.ref && s.ref.current)
          }
          onFinish={() => {
            try {
              const raw = localStorage.getItem('usuarioCamarize');
              let tourKey = 'camarize_home_tour_done';
              if (raw) {
                try {
                  const user = JSON.parse(raw);
                  const userId = user?._id || user?.id || user?.userId;
                  if (userId) tourKey = `camarize_home_tour_done_${userId}`;
                } catch {}
              }
              localStorage.setItem(tourKey, '1');
            } catch {}
            setShowTour(false);
          }}
        />
      )}
      
      {/* Modal de Relatório Geral */}
      <Modal 
        isOpen={showPeriodoModal}
        onClose={() => setShowPeriodoModal(false)}
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" fill="none"/>
                <path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Relatório Geral</span>
          </div>
        }
        showCloseButton={true}
      >
        {/* Descrição */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <p style={{
            margin: '0',
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Selecione o período para gerar o relatório geral de todos os cativeiros
          </p>
        </div>

        {/* Opções de período */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button 
            onClick={() => handlePeriodoSelect('dia')}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: 'linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)',
              color: '#1f2937',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(247, 176, 183, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span>📅 Relatório Diário</span>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Últimas 24h</span>
          </button>

          <button 
            onClick={() => handlePeriodoSelect('semana')}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: 'linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)',
              color: '#1f2937',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(247, 176, 183, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span>📊 Relatório Semanal</span>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Últimos 7 dias</span>
          </button>

          <button 
            onClick={() => handlePeriodoSelect('mes')}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: 'linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)',
              color: '#1f2937',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(247, 176, 183, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span>📈 Relatório Mensal</span>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Últimos 30 dias</span>
          </button>
        </div>
      </Modal>
      {/* Modal de Exclusão */}
      <Modal 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCativeiroToDelete(null);
        }}
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Confirmar Exclusão</span>
          </div>
        }
        showCloseButton={false}
      >
        {/* Mensagem */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <p style={{
            margin: '0',
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.5',
            maxWidth: '280px'
          }}>
            Tem certeza que deseja excluir este cativeiro? Esta ação não pode ser desfeita.
          </p>
        </div>
        
        {/* Botões */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%'
        }}>
          <button 
            onClick={() => {
              setShowDeleteModal(false);
              setCativeiroToDelete(null);
            }}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#374151',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#fff';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={confirmDelete}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#b91c1c';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#dc2626';
            }}
          >
            Excluir
          </button>
        </div>
      </Modal>
      {notification.show && (
        <Notification
          isVisible={notification.show}
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      {/* Modal de Informações */}
      <Modal 
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                <path d="M12 16V12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="8" r="1" fill="#3B82F6"/>
              </svg>
            </div>
            <span>Sobre o Camarize</span>
          </div>
        }
        showCloseButton={true}
      >
        {/* O que é o Camarize */}
        <div>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            🦐 O que é o Camarize?
          </h3>
          <p style={{
            margin: 0,
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#4b5563'
          }}>
            O Camarize é um sistema inteligente de monitoramento para cativeiros de camarão. 
            Ele ajuda você a acompanhar em tempo real as condições ideais para o cultivo, 
            garantindo a saúde e produtividade dos seus camarões.
          </p>
        </div>

        {/* Por que monitorar */}
        <div>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            📊 Por que monitorar estes parâmetros?
          </h3>
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#4b5563'
          }}>
            O monitoramento constante destes três parâmetros é essencial para o sucesso 
            do cultivo de camarões. Qualquer variação pode afetar diretamente a saúde 
            e o crescimento dos animais.
          </p>
        </div>

        {/* Parâmetros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Temperatura */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: '#fef3c7',
            border: '1px solid #fde68a'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>🌡️</span>
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#92400e'
              }}>
                Temperatura da Água
              </h4>
            </div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#92400e'
            }}>
              <strong>Por que é importante:</strong> A temperatura afeta diretamente o metabolismo, 
              crescimento e reprodução dos camarões. Temperaturas inadequadas podem causar 
              estresse, doenças e até mortalidade.
            </p>
          </div>

          {/* pH */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: '#dbeafe',
            border: '1px solid #93c5fd'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>🧪</span>
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e40af'
              }}>
                pH da Água
              </h4>
            </div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#1e40af'
            }}>
              <strong>Por que é importante:</strong> O pH influencia a disponibilidade de 
              nutrientes, a toxicidade de substâncias e o bem-estar dos camarões. 
              Valores inadequados podem causar problemas respiratórios e de crescimento.
            </p>
          </div>

          {/* Amônia */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: '#fce7f3',
            border: '1px solid #f9a8d4'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>⚗️</span>
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#be185d'
              }}>
                Nível de Amônia
              </h4>
            </div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#be185d'
            }}>
              <strong>Por que é importante:</strong> A amônia é tóxica para os camarões 
              mesmo em baixas concentrações. Níveis elevados podem causar danos nas 
              brânquias, estresse e mortalidade.
            </p>
          </div>
        </div>

        {/* Benefícios */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: '#f0fdf4',
          border: '1px solid #86efac'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#166534'
          }}>
            ✅ Benefícios do Monitoramento
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#166534'
          }}>
            <li>Prevenção de doenças e mortalidade</li>
            <li>Otimização do crescimento dos camarões</li>
            <li>Redução de perdas na produção</li>
            <li>Melhoria na qualidade da água</li>
            <li>Aumento da produtividade do cativeiro</li>
          </ul>
        </div>

        {/* Botão de fechar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb',
          marginTop: 'auto'
        }}>
          <button 
            onClick={() => setShowInfoModal(false)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#3B82F6',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#3B82F6';
            }}
          >
            Entendi!
          </button>
        </div>
      </Modal>
    </>
  );
}