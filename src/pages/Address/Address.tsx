import { useState } from 'react';
import { TextInput, Button } from '@randaotoken/component-library';
import { ProfileClient, ProfileInfo } from 'ao-process-clients';
import { bulkTransferAssets } from '../../utils/bulkTransfer';
import './Address.css';

interface Asset {
    id: string;
    type: string;
    quantity: number;
}

export function Address() {
    const [client, setClient] = useState<ProfileClient | null>(null);
    const [addressData, setAddressData] = useState<{
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

    const handleLoadAddress = async () => {
        setAddressData(prev => ({ ...prev, isLoading: true, error: undefined }));

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

            setAddressData({
                info,
                assets: assetList,
                isLoading: false
            });
        } catch (err) {
            console.error('Error loading address:', err);
            setAddressData(prev => ({
                ...prev,
                error: 'Failed to load address information',
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
        <div className="address-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Address</h1>
                    {client && (
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                            <div>Name: {addressData.info?.Profile.DisplayName || 'Not set'}</div>
                            <div>ID: {client.getProcessId()}</div>
                        </div>
                    )}
                </div>
                <Button
                    onClick={handleLoadAddress}
                    disabled={addressData.isLoading}
                >
                    {addressData.isLoading ? 'Loading...' : 'Refresh'}
                </Button>
            </div>

            {addressData.error && (
                <div className="error-message">
                    {addressData.error}
                </div>
            )}

            {addressData.assets.length > 0 && (
                <>
                    <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                        <div style={{ marginBottom: '1rem', color: '#666' }}>
                            Total Assets: {addressData.assets.length} | Selected: {selectedAssets.length}
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
                                                    selectedAssets.length < addressData.assets.length;
                                            }
                                        }}
                                        checked={addressData.assets.length > 0 &&
                                            selectedAssets.length === addressData.assets.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedAssets(addressData.assets.map(asset => asset.id));
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
                            {addressData.assets.map(asset => (
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
                        <div className={`status-message ${addressData.error ? 'error' : 'success'}`}>
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

            {addressData.info && (
                <div className="address-info">
                    <h2>Address Information</h2>
                    <pre>
                        {JSON.stringify(addressData.info, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
