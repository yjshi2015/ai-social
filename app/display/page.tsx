'use client';

import { useSuiClientQuery, useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { useSuiClient } from '@mysten/dapp-kit';
import Image from 'next/image';
import { FaHeart, FaGift } from 'react-icons/fa';
import { Transaction } from "@mysten/sui/transactions";
import toast from 'react-hot-toast';

interface ImageInfo {
  blob_id: string;
  blob_obj: string;
  owner: string;
}


export default function Display() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const displayImagesId = '0x745bf4e210b31d38ad425935376e4d12e87d7900bae0618e9873a21614b38f54';

  const { data, isPending, isError, error } = useSuiClientQuery(
    'getObject',
    {
      id: displayImagesId,
      options: {
        showContent: true,
      },
    },
  );

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images = (data?.data?.content as any)?.fields?.images || [];

  const handleTip = async (owner: string) => {
    if (!account) {
      toast.error('请先连接钱包');
      return;
    }

    try {
      const { data: coinsData } = await client.getCoins({
        owner: account?.address || '',
        coinType: '0xb3333cae47d18c47416d3a327df6aec8644709682e6c0b6e6668f5974be44238::ai_social::AI_SOCIAL',
      });

      if (!coinsData?.length) {
        toast.error('没有足够的 Social Coin');
        return;
      }

      const txb = new Transaction();

      if (coinsData.length > 1) {
        const primaryCoin = coinsData[0];
        const mergeCoins = coinsData.slice(1);
        
        txb.mergeCoins(
          txb.object(primaryCoin.coinObjectId),
          mergeCoins.map(coin => txb.object(coin.coinObjectId))
        );

        const [tipCoin] = txb.splitCoins(
          txb.object(primaryCoin.coinObjectId),
          [1000000000]
        );

        txb.transferObjects([tipCoin], txb.pure.address(owner));
      } else {
        const [tipCoin] = txb.splitCoins(
          txb.object(coinsData[0].coinObjectId),
          [1000000000]
        );

        txb.transferObjects([tipCoin], txb.pure.address(owner));
      }

      signAndExecuteTransaction(
        {
          transaction: txb,
        },
        {
          onSuccess: (result) => {
            console.log('打赏成功:', result);
            toast.success('打赏成功！');
            window.dispatchEvent(new Event('refreshBalances'));
          },
          onError: (error) => {
            console.error('打赏失败:', error);
            toast.error('打赏失败，请重试');
          },
        },
      );
    } catch (error) {
      console.error('打赏失败:', error);
      toast.error('打赏失败，请重试');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">作品展示</h1>
      
      {images.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">暂无作品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image: { fields: ImageInfo }, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="aspect-square relative mb-4">
                  <Image
                    src={`https://aggregator.walrus-testnet.walrus.space/v1/${image.fields.blob_id}`}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 flex space-x-2">
                    <button 
                      className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                      onClick={() => console.log('点赞')}
                    >
                      <FaHeart className="text-red-500 w-5 h-5" />
                    </button>
                    <button 
                      className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                      onClick={() => handleTip(image.fields.owner)}
                    >
                      <FaGift className="text-purple-500 w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">创作者：</span>
                    <a
                      href={`https://suiscan.xyz/testnet/address/${image.fields.owner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline break-all"
                    >
                      {image.fields.owner}
                    </a>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Blob ID：</span>
                    <a
                      href={`https://walruscan.com/testnet/blob/${image.fields.blob_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline break-all"
                    >
                      {image.fields.blob_id}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 