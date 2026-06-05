'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

export default function Home() {
  const [status, setStatus] = useState<string>('연결 중...');
  const [stocks, setStocks] = useState<any[]>([]);

  useEffect(() => {
    // 헬스체크
    apiGet('/health')
      .then(() => setStatus('연결됨'))
      .catch(() => setStatus('연결 실패'));

    // 주식 데이터 로드 (예시)
    apiGet('/stocks')
      .then(data => setStocks(data.slice(0, 10))) // 처음 10개만
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">StockScreen</h1>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === '연결됨' 
                  ? 'bg-green-100 text-green-800' 
                  : status === '연결 실패'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-lg font-medium text-gray-900 mb-4">주식 리스트</h2>
          
          {stocks.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {stocks.map((stock, index) => (
                  <li key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {stock.symbol || stock.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {stock.market || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {stock.price || 'N/A'}
                        </p>
                        <p className={`text-sm ${
                          stock.change_percent > 0 ? 'text-green-600' : 
                          stock.change_percent < 0 ? 'text-red-600' : 
                          'text-gray-500'
                        }`}>
                          {stock.change_percent ? `${stock.change_percent}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500">데이터를 로드하고 있습니다...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
