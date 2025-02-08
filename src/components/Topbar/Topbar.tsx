import './Topbar.css';
import { ConnectWallet, SocialIcons, ThemeToggle, Button } from '@randaotoken/component-library';

interface TopbarProps {
    onMenuClick: () => void;
}

export const Topbar = ({ onMenuClick }: TopbarProps) => {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <Button
                    variant="outline"
                    onClick={onMenuClick}
                    className="menu-button"
                    aria-label="Toggle menu"
                >
                    ☰
                </Button>
                <img src="/arcao.png" alt="ArcAO Logo" className="logo" />
                <div className="social-icons">
                    <SocialIcons
                        links={[
                            { platform: 'x', url: 'https://x.com/Arc_AO' },
                            { platform: 'discord', url: 'https://discord.com/invite/arc-ao' },
                            { platform: 'telegram', url: 'https://t.me/ArcAOGames' }
                        ]}
                    />
                </div>
            </div>
            <div className="topbar-right">
                <ThemeToggle />
                <ConnectWallet />
            </div>
        </div>
    );
};

export default Topbar;
