'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from "@mysten/sui/transactions";

interface WalrusResponse {
  newlyCreated: {
    blobObject: {
      id: string;
      blobId: string;
    }
  }
}

interface UploadedImage {
  url: string;
  suiObjectId: string;
  blobId: string;
  claimed: boolean;
}

interface GeneratedImage {
  url: string;
  blob: Blob;
}

export default function ImageGenerator() {
	const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const generateImage = async () => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('output_format', 'png');
      formData.append('style_preset', 'fantasy-art');

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '图片生成失败');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setGeneratedImages([{ url, blob }]);
    } catch (error) {
      console.error('图片生成失败:', error);
      alert(error instanceof Error ? error.message : '图片生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const uploadToWalrus = async (image: GeneratedImage) => {
    try {
      setUploadLoading(true);
      
      const formData = new FormData();
      formData.append('file', image.blob);

      const response = await fetch('/api/generate-image', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('上传错误:', errorData);
        throw new Error('上传失败');
      }

      const data: WalrusResponse = await response.json();
      console.log('上传响应:', data);
      
      const newImage: UploadedImage = {
        url: data.newlyCreated.blobObject.id,
        suiObjectId: data.newlyCreated.blobObject.id,
        blobId: data.newlyCreated.blobObject.blobId,
        claimed: false
      };
      
      setUploadedImages(prev => [...prev, newImage]);
      alert('图片已成功上传到 Walrus');

    } catch (error) {
      console.error('上传到 Walrus 失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploadLoading(false);
    }
  };

  const claimReward = async (suiObjectId: string, blobId: string) => {
    try {
      console.log(blobId);
      console.log(suiObjectId);
      const txb = new Transaction();
      
      txb.moveCall({
        target: '0xb3333cae47d18c47416d3a327df6aec8644709682e6c0b6e6668f5974be44238::ai_social::record_and_reward',
        arguments: [
          txb.pure.string(blobId),
          txb.pure.address(suiObjectId),
          // DisplayImages
          txb.object('0x745bf4e210b31d38ad425935376e4d12e87d7900bae0618e9873a21614b38f54'),
          txb.pure.u64(5000000000),
          // MemePool
          txb.object('0x056c40e87700d43a5c66864fb9ecb3ea35873e3897a0d9c5275e5d542fd5cca7'),
        ],
      });

      signAndExecuteTransaction({
        transaction: txb,
      }, {
        onSuccess: (result) => {
          console.log('交易成功:', result);
          setUploadedImages(prev => 
            prev.map(img => 
              img.suiObjectId === suiObjectId 
                ? { ...img, claimed: true }
                : img
            )
          );
          alert('奖励领取成功！');
        },
        onError: (error) => {
          console.error('交易失败:', error);
          alert('领取奖励失败，请重试');
        },
      });
    } catch (error) {
      console.error('领取奖励失败:', error);
      alert('领取奖励失败，请重试');
    }
  };

  useEffect(() => {
    return () => {
      generatedImages.forEach(image => URL.revokeObjectURL(image.url));
    };
  }, [generatedImages]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI 图片生成器</h1>
      
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="请输入图片描述..."
          rows={4}
        />
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 mr-4"
        onClick={generateImage}
        disabled={loading || !prompt}
      >
        {loading ? '生成中...' : '生成图片'}
      </button>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {generatedImages.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={image.url}
              alt={`Generated image ${index + 1}`}
              fill
              className="object-cover rounded"
            />
            <button
              className="absolute bottom-2 right-2 bg-green-500 text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
              onClick={() => uploadToWalrus(image)}
              disabled={uploadLoading}
            >
              {uploadLoading ? '上传中...' : '上传到 Walrus'}
            </button>
          </div>
        ))}
      </div>

      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">已上传的图片信息</h2>
          <div className="space-y-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Sui 对象 ID:</p>
                    <p className="font-mono text-sm break-all">{image.suiObjectId}</p>
                    <div className="mt-2">
                      <a 
                        href={`https://suiscan.xyz/testnet/object/${image.suiObjectId}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        在 Sui Explorer 中查看
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blob ID:</p>
                    <p className="font-mono text-sm break-all">{image.blobId}</p>
                    <div className="mt-2">
                      <a 
                        href={`https://walruscan.com/testnet/blob/${image.blobId}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        在 Walrus 中查看
                      </a>
                    </div>
                  </div>
                </div>
                {!image.claimed && (
                  <div className="mt-4">
                    <button
                      onClick={() => claimReward(image.suiObjectId, image.blobId)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      领取创作奖励
                    </button>
                  </div>
                )}
                {image.claimed && (
                  <div className="mt-4">
                    <span className="text-gray-500">✓ 已领取奖励</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
