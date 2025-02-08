import './Sidebar.css';

type PageType = 'home' | 'collections' | 'profile' | 'address' | 'send';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activePage: PageType;
    onNavigate: (page: PageType) => void;
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
                    <button
                        className={`tab ${activePage === 'address' ? 'active' : ''}`}
                        onClick={() => onNavigate('address')}
                    >
                        Address
                    </button>
                    <button
                        className={`tab ${activePage === 'send' ? 'active' : ''}`}
                        onClick={() => onNavigate('send')}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
