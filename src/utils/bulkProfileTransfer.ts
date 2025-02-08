import { ProfileClient } from 'ao-process-clients';

interface BulkTransferResult {
    successCount: number;
    failCount: number;
    failedAssets: string[];
}

export async function bulkTransferAssets(
    assetIds: string[],
    recipientId: string,
    onProgress?: (successCount: number) => void,
    profileClient?: ProfileClient
): Promise<BulkTransferResult> {
    if (!profileClient) {
        profileClient = await ProfileClient.createAutoConfigured();
    }
    let successCount = 0;
    let failCount = 0;
    const failedAssets: string[] = [];

    const transferWithRetry = async (assetId: string, retries = 5): Promise<boolean> => {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                await profileClient.transferAsset(
                    assetId,
                    recipientId,
                    "1"
                );
                return true;
            } catch (err) {
                if (attempt === retries - 1) {
                    console.error(`Failed to transfer NFT ${assetId} after ${retries} attempts:`, err);
                    return false;
                }
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return false;
    };

    const results = await Promise.all(
        assetIds.map(async assetId => {
            const success = await transferWithRetry(assetId);
            if (success) {
                successCount++;
                onProgress?.(successCount);
            } else {
                failCount++;
                failedAssets.push(assetId);
            }
            return { assetId, success };
        })
    );

    return {
        successCount,
        failCount,
        failedAssets
    };
}
