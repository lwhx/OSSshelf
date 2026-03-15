import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shareApi } from '@/services/api';
import { formatBytes, formatDate } from '@/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Link2, Trash2, Lock, Clock } from 'lucide-react';

export default function Shares() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shares, isLoading } = useQuery({
    queryKey: ['shares'],
    queryFn: () => shareApi.list().then((res) => res.data.data ?? []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => shareApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shares'] });
      toast({ title: '已删除分享链接' });
    },
    onError: () => {
      toast({ title: '删除失败', variant: 'destructive' });
    },
  });

  const handleCopyLink = (shareId: string) => {
    const url = `${window.location.origin}/api/share/${shareId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: '链接已复制' });
    });
  };

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
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{share.file?.name ?? '未知文件'}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span>创建于 {formatDate(share.createdAt)}</span>
                  {share.expiresAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      过期 {formatDate(share.expiresAt)}
                    </span>
                  )}
                  {share.password && (
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      已加密
                    </span>
                  )}
                  {share.downloadLimit && (
                    <span>{share.downloadCount}/{share.downloadLimit} 次下载</span>
                  )}
                  {share.file && (
                    <span>{formatBytes(share.file.size)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleCopyLink(share.id)}>
                  <Link2 className="h-4 w-4 mr-2" />
                  复制链接
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(share.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无分享</p>
          <p className="text-sm mt-1">从文件管理页面创建分享链接</p>
        </div>
      )}
    </div>
  );
}
