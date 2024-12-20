'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@mysten/dapp-kit';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';

export default function Header() {
  const pathname = usePathname();
  const account = useCurrentAccount();

  // 获取 SUI 余额，添加自动刷新
  const { data: suiBalance, refetch: refetchSui } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address || '',
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!account,
      refetchInterval: 3000, // 每3秒自动刷新
    }
  );

  // 获取 Social Coin 余额，添加自动刷新
  const { data: socialBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address || '',
      coinType: '0xb3333cae47d18c47416d3a327df6aec8644709682e6c0b6e6668f5974be44238::ai_social::AI_SOCIAL',
    },
    {
      enabled: !!account,
      refetchInterval: 3000, // 每3秒自动刷新
    }
  );

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Generate', path: '/generate/image' },
    { name: 'Display', path: '/display' },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <nav className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200 ${
                  pathname === item.path
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-6">
            {account && (
              <div className="flex space-x-4 bg-white/10 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <span className="text-white/60 text-sm">SUI:</span>
                  <span className="font-medium text-white">
                    {(Number(suiBalance?.totalBalance || 0) / 1000000000).toFixed(2)}
                  </span>
                </div>
                <div className="w-px bg-white/20" />
                <div className="flex items-center space-x-2">
                  <span className="text-white/60 text-sm">SOCIAL:</span>
                  <span className="font-medium text-white">
                    {(Number(socialBalance?.totalBalance || 0) / 1000000000).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <div className="pl-2 border-l border-white/20">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 