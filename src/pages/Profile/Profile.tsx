import { useState } from 'react';
import { TextInput, Button } from '@randaotoken/component-library';
import { ProfileClient, ProfileInfo } from 'ao-process-clients';
import { bulkTransferAssets } from '../../utils/bulkProfileTransfer';
import './Profile.css';

interface Asset {
    id: string;
    type: string;
    quantity: number;
}

export function Profile() {
    const [client, setClient] = useState<ProfileClient | null>(null);
    const [profileData, setProfileData] = useState<{
        info: ProfileInfo | null;
        assets: Asset[];
        error?: string;
        isLoading?: boolean;
    }>({
        info: null,
        assets: [],
        isLoading: false
    });
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [recipientId, setRecipientId] = useState('');
    const [transferStatus, setTransferStatus] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);

    const handleLoadProfile = async () => {
        setProfileData(prev => ({ ...prev, isLoading: true, error: undefined }));

        try {
            const profileClient = await ProfileClient.createAutoConfigured();
            setClient(profileClient);
            const info = await profileClient.getProfileInfo();

            const assetList = info.Assets?.map((asset: any) => {
                const assetId = asset.Id as string
                return {
                    id: assetId,
                    type: typeof asset === 'string' ? 'NFT' : (asset.type || 'NFT'),
                    quantity: typeof asset === 'string' ? 1 : (asset.quantity || 1)
                };
            }) || [];

            setProfileData({
                info,
                assets: assetList,
                isLoading: false
            });
        } catch (err) {
            console.error('Error loading profile:', err);
            setProfileData(prev => ({
                ...prev,
                error: 'Failed to load profile information',
                isLoading: false
            }));
        }
    };

    const handleTransfer = async () => {
        if (!recipientId) {
            setTransferStatus('Please enter a recipient address');
            return;
        }

        if (selectedAssets.length === 0) {
            setTransferStatus('Please select assets to transfer');
            return;
        }

        setIsTransferring(true);
        setTransferStatus('Starting transfer process...');

        try {
            if (!client) {
                setTransferStatus('Client not initialized');
                return;
            }

            const result = await bulkTransferAssets(
                selectedAssets,
                recipientId,
                (count) => setTransferStatus(`Transferred ${count} assets successfully...`),
                client
            );

            setTransferStatus(
                `Transfer complete. Successfully transferred ${result.successCount} assets` +
                (result.failCount > 0 ? `, ${result.failCount} failed` : '')
            );
        } catch (err) {
            console.error('Transfer error:', err);
            setTransferStatus('Failed to complete transfer process');
        } finally {
            setIsTransferring(false);
        }
    };

    return (
        <div className="profile-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Profile</h1>
                    {client && (
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                            <div>Name: {profileData.info?.Profile.DisplayName || 'Not set'}</div>
                            <div>ID: {client.getProcessId()}</div>
                        </div>
                    )}
                </div>
                <Button
                    onClick={handleLoadProfile}
                    disabled={profileData.isLoading}
                >
                    {profileData.isLoading ? 'Loading...' : 'Refresh'}
                </Button>
            </div>

            {profileData.error && (
                <div className="error-message">
                    {profileData.error}
                </div>
            )}

            {profileData.assets.length > 0 && (
                <>
                    <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                        <div style={{ marginBottom: '1rem', color: '#666' }}>
                            Total Assets: {profileData.assets.length} | Selected: {selectedAssets.length}
                        </div>
                        <TextInput
                            label="Recipient Address"
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            placeholder="Enter recipient address"
                            width="1000px"
                        />
                    </div>

                    <table className="assets-table">
                        <thead>
                            <tr>
                                <th className="checkbox-cell">
                                    <input
                                        type="checkbox"
                                        ref={checkbox => {
                                            if (checkbox) {
                                                checkbox.indeterminate = selectedAssets.length > 0 &&
                                                    selectedAssets.length < profileData.assets.length;
                                            }
                                        }}
                                        checked={profileData.assets.length > 0 &&
                                            selectedAssets.length === profileData.assets.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedAssets(profileData.assets.map(asset => asset.id));
                                            } else {
                                                setSelectedAssets([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profileData.assets.map(asset => (
                                <tr key={asset.id}>
                                    <td className="checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedAssets.includes(asset.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedAssets(prev => [...prev, asset.id]);
                                                } else {
                                                    setSelectedAssets(prev => prev.filter(id => id !== asset.id));
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>{asset.id}</td>
                                    <td>{asset.type}</td>
                                    <td>{asset.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {transferStatus && (
                        <div className={`status-message ${profileData.error ? 'error' : 'success'}`}>
                            {transferStatus}
                        </div>
                    )}

                    <div style={{ marginTop: '2rem' }}>
                        <Button
                            onClick={handleTransfer}
                            disabled={isTransferring || selectedAssets.length === 0}
                        >
                            {isTransferring ? 'Transferring...' : 'Transfer Selected Assets'}
                        </Button>
                    </div>
                </>
            )}

            {profileData.info && (
                <div className="profile-info">
                    <h2>Profile Information</h2>
                    <pre>
                        {JSON.stringify(profileData.info, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
