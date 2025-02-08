import { NftClient } from 'ao-process-clients';

interface BulkTransferResult {
    successCount: number;
    failCount: number;
    failedAssets: string[];
}

export async function bulkNftTransfer(
    processIds: string[],
    assetIds: string[],
    recipientId: string,
    onProgress?: (successCount: number) => void
): Promise<BulkTransferResult> {
    let successCount = 0;
    let failCount = 0;
    const failedAssets: string[] = [];

    // Create NFT clients for each process ID
    const nftClients = await Promise.all(
        processIds.map(async (processId) => {
            const client = new NftClient();
            await client.load(processId);
            return client;
        })
    );

    const transferWithRetry = async (client: NftClient, assetId: string, retries = 5): Promise<boolean> => {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const message = {
                    Target: recipientId,
                    Action: "Transfer",
                    Quantity: "1",
                    AssetId: assetId
                };
                await client.message(message);
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

    // Distribute assets across available NFT clients
    const clientCount = nftClients.length;
    const results = await Promise.all(
        assetIds.map(async (assetId, index) => {
            // Round-robin distribution of assets to clients
            const client = nftClients[index % clientCount];
            const success = await transferWithRetry(client, assetId);
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
