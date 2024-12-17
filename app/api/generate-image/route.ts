import { NextResponse } from 'next/server';

// 生成图片
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const prompt = formData.get('prompt');

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
      throw new Error(`Stability API error: ${JSON.stringify(errorData)}`);
    }

    const imageBlob = await response.blob();
    return new NextResponse(imageBlob, {
      headers: {
        'Content-Type': 'image/png'
      }
    });
  } catch (error) {
    console.error('生成图片失败:', error);
    return NextResponse.json({ error: '生成图片失败' }, { status: 500 });
  }
}

// 上传到 Walrus
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    
    const response = await fetch('https://publisher.walrus-testnet.walrus.space/v1/store?epochs=5', {
      method: 'PUT',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Walrus 上传失败');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('上传到 Walrus 失败:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
} 