import { useState } from 'react';
import { NftClient } from 'ao-process-clients';
import { bulkNftTransfer } from '../../utils/bulkNftTransfer';

export const Send = () => {
    const [processIds, setProcessIds] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [assetIds, setAssetIds] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('Creating NFT clients...');

        try {
            const processIdList = processIds.split(',').map(id => id.trim());
            const assetIdList = assetIds.split(',').map(id => id.trim());

            // Create NFT clients for each process ID
            const nftClients = await Promise.all(
                processIdList.map(async (processId) => {
                    return new NftClient(processId);
                })
            );

            setStatus('Starting bulk transfer...');
            const result = await bulkNftTransfer(
                nftClients,
                assetIdList,
                recipientId,
                (count: number) => setStatus(`Transferred ${count} assets...`)
            );

            setStatus(`Complete! Successfully transferred ${result.successCount} assets. Failed: ${result.failCount}`);
        } catch (error: unknown) {
            setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Bulk NFT Send</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Process IDs (comma separated):
                        <textarea
                            value={processIds}
                            onChange={(e) => setProcessIds(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '60px',
                                marginTop: '5px',
                                background: 'var(--color-grey-800)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-grey-700)',
                                borderRadius: '4px',
                                padding: '8px'
                            }}
                            placeholder="Enter process IDs, separated by commas"
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Asset IDs (comma separated):
                        <textarea
                            value={assetIds}
                            onChange={(e) => setAssetIds(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '60px',
                                marginTop: '5px',
                                background: 'var(--color-grey-800)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-grey-700)',
                                borderRadius: '4px',
                                padding: '8px'
                            }}
                            placeholder="Enter asset IDs, separated by commas"
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Recipient ID:
                        <input
                            type="text"
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            style={{
                                width: '100%',
                                marginTop: '5px',
                                background: 'var(--color-grey-800)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-grey-700)',
                                borderRadius: '4px',
                                padding: '8px'
                            }}
                            placeholder="Enter recipient ID"
                        />
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    {isLoading ? 'Processing...' : 'Send NFTs'}
                </button>
            </form>
            {status && (
                <div style={{ marginTop: '20px', padding: '10px', background: 'var(--color-grey-800)', borderRadius: '4px' }}>
                    {status}
                </div>
            )}
        </div>
    );
};

export default Send;
