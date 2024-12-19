'use client';

import { useSuiClientQuery } from '@mysten/dapp-kit';
import Image from 'next/image';

interface ImageInfo {
  blob_id: string;
  blob_obj: string;
  owner: string;
}

export default function Display() {
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

  const images = data?.data?.content?.fields?.images || [];

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