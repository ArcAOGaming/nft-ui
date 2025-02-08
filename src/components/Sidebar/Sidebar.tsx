import './Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activePage: string;
    onNavigate: (page: string) => void;
}

export const Sidebar = ({ isOpen, onClose, activePage, onNavigate }: SidebarProps) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="tabs">
                    <button
                        className={`tab ${activePage === 'home' ? 'active' : ''}`}
                        onClick={() => onNavigate('home')}
                    >
                        Home
                    </button>
                    <button
                        className={`tab ${activePage === 'collections' ? 'active' : ''}`}
                        onClick={() => onNavigate('collections')}
                    >
                        Collections
                    </button>
                    <button
                        className={`tab ${activePage === 'profile' ? 'active' : ''}`}
                        onClick={() => onNavigate('profile')}
                    >
                        Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
