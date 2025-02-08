import { useState, ChangeEvent } from 'react';
import { TextInput, Button } from '@randaotoken/component-library';
import {
    CollectionClient,
    CollectionInfo,
    getCollectionClientAutoConfiguration,
} from 'ao-process-clients';
import { bulkTransferAssets } from '../../utils/bulkTransfer';
import './Collections.css';

export function Collections() {
    const [processId, setProcessId] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null);
    const [error, setError] = useState('');
    const [transferStatus, setTransferStatus] = useState<string>('');
    const [isTransferring, setIsTransferring] = useState(false);

    const handleProcessIdChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setProcessId(value);
        setError('');

        if (value) {
            try {
                const config = getCollectionClientAutoConfiguration();
                config.processId = value;
                const client = new CollectionClient(config);
                const info = await client.getInfo();
                setCollectionInfo(info);
            } catch (err) {
                setError('Failed to fetch collection configuration');
                console.error('Error fetching collection config:', err);
            }
        } else {
            setCollectionInfo(null);
        }
    };

    const handleTransfer = async () => {
        if (!recipientId) {
            setTransferStatus('Please enter a recipient address');
            return;
        }

        if (!collectionInfo?.Assets?.length) {
            setTransferStatus('No assets to transfer');
            return;
        }

        setIsTransferring(true);
        setTransferStatus('Starting transfer process...');

        try {
            const result = await bulkTransferAssets(
                collectionInfo.Assets,
                recipientId,
                (count) => setTransferStatus(`Transferred ${count} NFTs successfully...`)
            );

            setTransferStatus(
                `Transfer complete. Successfully transferred ${result.successCount} NFTs${result.failCount > 0 ? `, ${result.failCount} failed` : ''}`
            );
        } catch (err) {
            console.error('Transfer error:', err);
            setTransferStatus('Failed to complete transfer process');
        } finally {
            setIsTransferring(false);
        }
    };

    return (
        <div className="collections-container">
            <h1>Collections</h1>
            <TextInput
                label="Process ID"
                value={processId}
                onChange={(e) => handleProcessIdChange(e)}
                placeholder="Enter process ID"
                width="1000px"
            />

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div style={{ marginTop: '2rem' }}>
                <TextInput
                    label="Recipient Address"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    placeholder="Enter recipient address"
                    width="1000px"
                />
            </div>

            {transferStatus && (
                <div className={`status-message ${error ? 'error' : 'success'}`}>
                    {transferStatus}
                </div>
            )}

            {collectionInfo && collectionInfo.Assets && collectionInfo.Assets.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <Button
                        onClick={handleTransfer}
                        disabled={isTransferring}
                    >
                        {isTransferring ? 'Transferring...' : 'Transfer All NFTs'}
                    </Button>
                </div>
            )}

            {collectionInfo && (
                <div className="config-display">
                    <h2>Collection Information</h2>
                    <pre>
                        {JSON.stringify(collectionInfo, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
