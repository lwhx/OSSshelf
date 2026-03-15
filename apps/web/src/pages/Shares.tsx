import { useQuery } from '@tanstack/react-query';
import { shareApi } from '@/services/api';
import { formatBytes, formatDate } from '@/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';

export default function Shares() {
  const { data: shares, isLoading } = useQuery({
    queryKey: ['shares'],
    queryFn: async () => {
      // This would need a backend endpoint to list user's shares
      return [];
    },
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">分享管理</h1>
        <p className="text-muted-foreground">管理您的文件分享链接</p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : shares && shares.length > 0 ? (
        <div className="bg-card border rounded-lg divide-y">
          {shares.map((share: any) => (
            <div key={share.id} className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <p className="font-medium">{share.file?.name}</p>
                <p className="text-sm text-muted-foreground">
                  创建于 {formatDate(share.createdAt)}
                  {share.expiresAt && ` · 过期时间 ${formatDate(share.expiresAt)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Link className="h-4 w-4 mr-2" />
                  复制链接
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无分享</p>
          <p className="text-sm mt-1">从文件管理页面创建分享链接</p>
        </div>
      )}
    </div>
  );
}
