import { useState, useEffect } from 'react';
import { Button } from '@randaotoken/component-library';
import { bulkNftTransfer } from '../../utils/bulkNftTransfer';
import { bulkTransferAssets } from '../../utils/bulkProfileTransfer';
import { NftClient } from 'ao-process-clients';
import './Send.css';

export const Send = () => {
    const [useProfile, setUseProfile] = useState(false);
    const [recipientId, setRecipientId] = useState('');
    const [assetIds, setAssetIds] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [validationResults, setValidationResults] = useState<{
        nftCount: number;
        nonNftCount: number;
        nonNftIds: string[];
    }>({ nftCount: 0, nonNftCount: 0, nonNftIds: [] });

    useEffect(() => {
        const validateAssets = async () => {
            if (!assetIds) return;

            const assetIdList = assetIds.split(',').map(id => id.trim()).filter(Boolean);
            if (assetIdList.length === 0) return;

            let nftCount = 0;
            let nonNftCount = 0;
            const nonNftIds: string[] = [];

            for (const assetId of assetIdList) {
                try {
                    const client = new NftClient(assetId);
                    const info = await client.getInfo("1");
                    if (info !== undefined && info !== null && Object.keys(info).length > 0) {
                        nftCount++;
                    } else {
                        nonNftCount++;
                        nonNftIds.push(assetId);
                    }
                } catch (error) {
                    nonNftCount++;
                    nonNftIds.push(assetId);
                }
            }

            setValidationResults({ nftCount, nonNftCount, nonNftIds });
        };

        validateAssets();
    }, [assetIds]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('Starting transfer...');

        try {
            const assetIdList = assetIds.split(',').map(id => id.trim()).filter(Boolean);

            if (assetIdList.length === 0) {
                throw new Error('Please enter at least one asset ID');
            }

            if (!recipientId.trim()) {
                throw new Error('Please enter a valid recipient ID');
            }

            if (useProfile) {
                const result = await bulkTransferAssets(
                    assetIdList,
                    recipientId,
                    (count: number) => setStatus(`Transferred ${count} assets...`)
                );
                setStatus(`Complete! Successfully transferred ${result.successCount} assets. Failed: ${result.failCount}`);
            } else {
                const result = await bulkNftTransfer(
                    assetIdList,
                    recipientId,
                    (count: number) => setStatus(`Transferred ${count} assets...`)
                );
                setStatus(`Complete! Successfully transferred ${result.successCount} assets. Failed: ${result.failCount}`);
            }
        } catch (error: unknown) {
            setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="send-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Send Assets</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        background: 'var(--color-grey-800)'
                    }}>
                        <input
                            type="checkbox"
                            checked={useProfile}
                            onChange={(e) => setUseProfile(e.target.checked)}
                        />
                        Use Profile Implementation
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Asset IDs (comma separated):
                        <textarea
                            value={assetIds}
                            onChange={(e) => setAssetIds(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                marginTop: '0.5rem',
                                background: 'var(--color-grey-100)',
                                color: 'var(--color-grey-900)',
                                border: '1px solid var(--color-grey-300)',
                                borderRadius: '4px',
                                padding: '0.75rem',
                                fontSize: '1rem'
                            }}
                            placeholder="Enter asset IDs, separated by commas"
                        />
                    </label>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Recipient ID:
                        <input
                            type="text"
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            style={{
                                width: '100%',
                                marginTop: '0.5rem',
                                background: 'var(--color-grey-100)',
                                color: 'var(--color-grey-900)',
                                border: '1px solid var(--color-grey-300)',
                                borderRadius: '4px',
                                padding: '0.75rem',
                                fontSize: '1rem'
                            }}
                            placeholder="Enter recipient ID"
                        />
                    </label>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : `Send Assets using ${useProfile ? 'Profile' : 'NFT'} Implementation`}
                </Button>

                {(status || validationResults.nonNftCount > 0) && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'var(--color-grey-800)',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                    }}>
                        {status}
                        {validationResults.nftCount > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                                Valid NFTs: {validationResults.nftCount}
                            </div>
                        )}
                        {validationResults.nonNftCount > 0 && (
                            <>
                                <div style={{ marginTop: '0.5rem', color: 'var(--color-grey-400)' }}>
                                    Non-NFT Assets: {validationResults.nonNftCount}
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-grey-400)' }}>
                                    Non-NFT IDs: {validationResults.nonNftIds.join(', ')}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}
