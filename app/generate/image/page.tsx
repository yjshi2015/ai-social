'use client';

import { useState } from "react";
import Image from "next/image";



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
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const generateImage = async () => {
    try {
      setLoading(true);
      
      // 创建 FormData 对象
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('output_format', 'png');

      const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          'accept': 'image/*',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
      }

      // 获取二进制数据并转换为 base64
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      setGeneratedImages([base64]);
    } catch (error) {
      console.error('图片生成失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadToWalrus = async (base64Image: string) => {
    try {
      setUploadLoading(true);
      
      // 将 base64 转换为 Blob
      const base64Data = base64Image.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // 创建 FormData
      const formData = new FormData();
      formData.append('file', blob, 'generated-image.png');

      const response = await fetch('https://publisher.walrus-testnet.walrus.space/v1/store?epochs=5', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data: WalrusResponse = await response.json();
      console.log(data);
      
      const newImage: UploadedImage = {
        url: data.newlyCreated.blobObject.id, // 或其他URL构造方式
        suiObjectId: data.newlyCreated.blobObject.id,
        blobId: data.newlyCreated.blobObject.blobId
      };
      
      setUploadedImages(prev => [...prev, newImage]);
      
      // 显示成功消息
      alert(`图片已成功上传到 Walrus`);

    } catch (error) {
      console.error('上传到 Walrus 失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploadLoading(false);
    }
  };

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
        {generatedImages.map((imageUrl, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={imageUrl}
              alt={`Generated image ${index + 1}`}
              fill
              className="object-cover rounded"
            />
            <button
              className="absolute bottom-2 right-2 bg-green-500 text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
              onClick={() => uploadToWalrus(imageUrl)}
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
