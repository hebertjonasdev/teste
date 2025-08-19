import React, { useState, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// --- Interfaces (Data Structures) ---
interface Event {
  id: number;
  name: string;
  image: string;
  category: 'Festa' | 'Bar' | 'Show' | 'Cultural';
  musicStyle: string;
  distance: string;
  status: 'bombando' | 'medio' | 'fraco';
  description: string;
  address: string;
  isFeatured?: boolean;
  vibe?: string; // For "Vibes" in real-time
  ticketLink?: string; // For ticket integration
}

interface LikedEvent extends Event {
  superLiked: boolean;
}

type Page = 'discovery' | 'roles' | 'profile';

// --- Mock Data (Simulating a Backend) ---
const initialEvents: Event[] = [
  {
    id: 1,
    name: 'Techno Destrói',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80',
    category: 'Festa', musicStyle: 'Techno', distance: '5 km', status: 'bombando',
    description: 'Uma noite de techno pesado com os melhores DJs da cena underground. Prepare-se para uma experiência sonora intensa e inesquecível.',
    address: 'Rua Augusta, 123 - São Paulo, SP',
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Samba do Beco',
    image: 'https://images.unsplash.com/photo-1579482736856-c5798634c311?w=500&q=80',
    category: 'Bar', musicStyle: 'Samba', distance: '2 km', status: 'medio',
    description: 'Roda de samba tradicional com petiscos de boteco e cerveja gelada. O melhor clima para um happy hour animado.',
    address: 'Vila Madalena, 45 - São Paulo, SP',
  },
  {
    id: 3,
    name: 'Indie Sessions',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=500&q=80',
    category: 'Show', musicStyle: 'Indie Rock', distance: '8 km', status: 'bombando',
    description: 'Festival com as bandas mais quentes do cenário indie rock nacional e internacional. Garanta seu ingresso!',
    address: 'Arena Interlagos - São Paulo, SP',
    ticketLink: '#',
  },
  {
    id: 4,
    name: 'Cine-Arte na Praça',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
    category: 'Cultural', musicStyle: 'Variado', distance: '3 km', status: 'fraco',
    description: 'Exibição de filmes clássicos ao ar livre. Traga sua canga e aproveite uma noite de cinema sob as estrelas.',
    address: 'Praça da Liberdade - Belo Horizonte, MG',
    vibe: 'Em tempo real'
  },
  {
    id: 5,
    name: 'Forró do Candeeiro',
    image: 'https://images.unsplash.com/photo-1558200234-a05c6a15714c?w=500&q=80',
    category: 'Festa', musicStyle: 'Forró', distance: '6 km', status: 'medio',
    description: 'Arrasta o pé a noite toda ao som do melhor do forró pé de serra. Ambiente acolhedor e gente animada.',
    address: 'Rua dos Pinheiros, 789 - São Paulo, SP',
  },
  {
    id: 6,
    name: 'Jazz Club Noturno',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    category: 'Bar', musicStyle: 'Jazz', distance: '10 km', status: 'medio',
    description: 'Música ao vivo de alta qualidade em um ambiente sofisticado. Perfeito para apreciar boa música e drinks.',
    address: 'Alameda Lorena, 1500 - São Paulo, SP',
  },
];

// --- Main App Component ---
const App = () => {
  const [activePage, setActivePage] = useState<Page>('discovery');
  const [likedEvents, setLikedEvents] = useState<LikedEvent[]>([]);
  const [superLikes, setSuperLikes] = useState(3);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleLikeEvent = (event: Event, superLiked = false) => {
    setLikedEvents(prev => [...prev, { ...event, superLiked }]);
    if(superLiked) {
      setSuperLikes(prev => prev - 1);
    }
  };

  const handleOpenModal = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'discovery':
        return <DiscoveryPage events={initialEvents} onLike={handleLikeEvent} superLikes={superLikes} onCardClick={handleOpenModal} />;
      case 'roles':
        return <MyRolesPage likedEvents={likedEvents} onCardClick={handleOpenModal} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DiscoveryPage events={initialEvents} onLike={handleLikeEvent} superLikes={superLikes} onCardClick={handleOpenModal} />;
    }
  };

  return (
    <>
      <Header />
      <main className="app-main">
        {renderPage()}
      </main>
      <BottomNav activePage={activePage} onNavigate={setActivePage} />
      {selectedEvent && <EventDetailsModal event={selectedEvent} onClose={handleCloseModal} />}
    </>
  );
};

// --- Page & UI Components ---

const Header = () => <header className="app-header">Pra Onde Vamos?</header>;

const FilterBar = ({ activeFilter, onFilterChange }: { activeFilter: string, onFilterChange: (filter: string) => void }) => {
  const filters = ['Todos', 'Festas', 'Bares', 'Shows', 'Cultural'];
  return (
    <div className="filter-bar">
      {filters.map(filter => (
        <button
          key={filter}
          className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

const DiscoveryPage = ({ events, onLike, superLikes, onCardClick }: { events: Event[], onLike: (event: Event, superLiked?: boolean) => void, superLikes: number, onCardClick: (event: Event) => void }) => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [deck, setDeck] = useState(events);
  
  const filteredDeck = useMemo(() => {
    if (activeFilter === 'Todos') return deck;
    const filterMap = { 'Festas': 'Festa', 'Bares': 'Bar', 'Shows': 'Show' };
    return deck.filter(event => event.category === (filterMap[activeFilter] || activeFilter));
  }, [deck, activeFilter]);
  
  const currentCard = filteredDeck.length > 0 ? filteredDeck[0] : null;

  const handleDecision = (superLiked = false) => {
    if (!currentCard) return;
    if (superLiked && superLikes > 0) {
      onLike(currentCard, true);
    } else if (!superLiked) {
      onLike(currentCard, false); // Assuming a normal like
    } else {
        // Handle pass or do nothing
    }

    setDeck(prev => prev.filter(e => e.id !== currentCard.id));
  };
  
  const handlePass = () => {
      if(!currentCard) return;
      setDeck(prev => prev.filter(e => e.id !== currentCard.id));
  }

  return (
    <div className="page-content">
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <div className="discovery-deck">
        <DiscoveryDeck stack={filteredDeck} onCardClick={onCardClick}/>
        {currentCard && <DeckActions onLike={() => handleDecision(false)} onSuperLike={() => handleDecision(true)} onPass={handlePass} superLikes={superLikes} />}
      </div>
    </div>
  );
};

const DiscoveryDeck = ({ stack, onCardClick }: { stack: Event[], onCardClick: (event: Event) => void }) => {
    if(stack.length === 0) {
        return <div className="end-of-deck-message">
            <i className="ph ph-map-trifold"></i>
            <p>Você viu todos os rolês por aqui!</p>
            <p>Volte mais tarde para novidades.</p>
        </div>
    }
    
    return(
        <div className="discovery-card-container">
            {stack.slice(0, 3).reverse().map((event, index) => (
                 <DiscoveryCard 
                    key={event.id} 
                    event={event} 
                    isTop={index === stack.slice(0, 3).length - 1}
                    style={{ 
                        transform: `translateY(${-index * 10}px) scale(${1 - index * 0.05})`,
                        zIndex: stack.length - index,
                    }}
                    onCardClick={onCardClick}
                />
            ))}
        </div>
    );
}

const DiscoveryCard = ({ event, isTop, style, onCardClick }: { event: Event, isTop: boolean, style: React.CSSProperties, onCardClick: (event: Event) => void }) => (
  <div className="discovery-card" style={{ ...style, backgroundImage: `url(${event.image})` }} onClick={() => onCardClick(event)}>
    <div className="discovery-card-overlay"></div>
    {event.isFeatured && <div className="featured-badge"><i className="ph-fill ph-star"></i> Destaque</div>}
    {event.vibe && <div className="vibe-badge"><i className="ph-fill ph-fire"></i> {event.vibe}</div>}
    <div className="discovery-card-content">
      <h3>{event.name}</h3>
      <div className="discovery-card-info">
        <span>{event.musicStyle}</span>
        <span>•</span>
        <span>{event.distance}</span>
        <span className={`event-status status-${event.status}`}>{event.status}</span>
      </div>
    </div>
  </div>
);

const DeckActions = ({ onPass, onLike, onSuperLike, superLikes }: { onPass: () => void, onLike: () => void, onSuperLike: () => void, superLikes: number }) => (
  <div className="deck-actions">
    <button className="action-button pass" onClick={onPass} aria-label="Passar"><i className="ph-bold ph-x"></i></button>
    <button className="action-button super-like" onClick={onSuperLike} disabled={superLikes === 0} aria-label="Super Like"><i className="ph-fill ph-star"></i></button>
    <button className="action-button like" onClick={onLike} aria-label="Gostar"><i className="ph-fill ph-heart"></i></button>
  </div>
);


const MyRolesPage = ({ likedEvents, onCardClick }: { likedEvents: LikedEvent[], onCardClick: (event: Event) => void }) => {
  if (likedEvents.length === 0) {
    return (
      <div className="page-container empty-state">
        <i className="ph ph-ticket"></i>
        <h3>Nenhum rolê salvo</h3>
        <p>Curta os eventos que você gosta para eles aparecerem aqui!</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {likedEvents.map(event => (
        <div key={event.id} className="liked-event-card" onClick={() => onCardClick(event)}>
          <img src={event.image} alt={event.name} className="liked-event-image" />
          <div className="liked-event-info">
            <h3>{event.name}</h3>
            <p>{event.category} • {event.musicStyle}</p>
          </div>
          {event.superLiked && <div className="super-liked-badge"><i className="ph-fill ph-star"></i></div>}
        </div>
      ))}
    </div>
  );
};

const ProfilePage = () => (
  <div className="page-container empty-state">
    <i className="ph ph-person-simple"></i>
    <h3>Página de Perfil</h3>
    <p>Esta área está em construção. Volte em breve!</p>
  </div>
);

const BottomNav = ({ activePage, onNavigate }: { activePage: Page, onNavigate: (page: Page) => void }) => (
  <nav className="bottom-nav">
    <button className={`nav-item ${activePage === 'discovery' ? 'active' : ''}`} onClick={() => onNavigate('discovery')}>
      <i className="ph-fill ph-compass"></i>
      <span>Descobrir</span>
    </button>
    <button className={`nav-item ${activePage === 'roles' ? 'active' : ''}`} onClick={() => onNavigate('roles')}>
      <i className="ph-fill ph-ticket"></i>
      <span>Meus Rolês</span>
    </button>
    <button className={`nav-item ${activePage === 'profile' ? 'active' : ''}`} onClick={() => onNavigate('profile')}>
      <i className="ph-fill ph-user-circle"></i>
      <span>Perfil</span>
    </button>
  </nav>
);

const EventDetailsModal = ({ event, onClose }: { event: Event; onClose: () => void }) => {
  const [vibeSubmitted, setVibeSubmitted] = useState(false);

  const handleVibeSubmit = () => {
    setVibeSubmitted(true);
    // In a real app, you'd send this data to a backend.
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar modal">&times;</button>
        <img src={event.image} alt={event.name} className="modal-image" />
        <h2>{event.name}</h2>
        <p><strong>Endereço:</strong> {event.address}</p>
        <p>{event.description}</p>

        <div className="vibe-report-section">
          <h3>Qual é a Vibe?</h3>
          {vibeSubmitted ? (
            <p className="vibe-submitted-message">Obrigado por compartilhar!</p>
          ) : (
            <div className="vibe-buttons">
              <button className="vibe-button fraco" onClick={handleVibeSubmit}>Fraco</button>
              <button className="vibe-button medio" onClick={handleVibeSubmit}>Médio</button>
              <button className="vibe-button bombando" onClick={handleVibeSubmit}>Bombando</button>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {event.ticketLink && (
            <a href={event.ticketLink} className="button button-primary" target="_blank" rel="noopener noreferrer">
              Comprar Ingresso
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// --- App Initialization ---
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
