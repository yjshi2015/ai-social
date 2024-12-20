'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@mysten/dapp-kit';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';

export default function Header() {
  const pathname = usePathname();
  const account = useCurrentAccount();

  // 获取 SUI 余额
  const { data: suiBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address || '',
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!account,
    }
  );

  // 获取 Social Coin 余额
  const { data: socialBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address || '',
      coinType: '0xb3333cae47d18c47416d3a327df6aec8644709682e6c0b6e6668f5974be44238::ai_social::AI_SOCIAL',
    }
  );

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Generate', path: '/generate/image' },
    { name: 'Display', path: '/display' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <nav className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  pathname === item.path
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            {account && (
              <>
                <div className="text-sm text-gray-600">
                  SUI: {(Number(suiBalance?.totalBalance || 0) / 1000000000).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  SOCIAL COIN: {(Number(socialBalance?.totalBalance || 0) / 1000000000).toFixed(2)}
                </div>
              </>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
} 