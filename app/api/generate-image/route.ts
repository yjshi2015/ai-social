import { NextResponse } from 'next/server';

// 生成图片
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

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
      const errorMessage = response.statusText || errorData.statusText || '发生未知错误，请稍后再试。';
      throw new Error(`Stability API error: ${errorMessage}`);
    }

    const imageBlob = await response.blob();
    return new NextResponse(imageBlob, {
      headers: {
        'Content-Type': 'image/png'
      }
    });
  } catch (error) {
    console.error(error);
    console.log("2---------------");
    console.error(error.message);
    console.log("2.2---------------");
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
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