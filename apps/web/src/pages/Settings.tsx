import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatBytes } from '@/utils';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');

  const apiBase = import.meta.env.VITE_API_URL || '';
  const webdavUrl = `${apiBase}/dav`;

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Placeholder: extend API with a PATCH /api/auth/me endpoint later
      return { name };
    },
    onSuccess: (data) => {
      updateUser({ name: data.name });
      toast({ title: '保存成功', description: '个人信息已更新' });
    },
    onError: () => {
      toast({ title: '保存失败', variant: 'destructive' });
    },
  });

  const storagePercent = user
    ? Math.min(100, ((user.storageUsed || 0) / (user.storageQuota || 1)) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-muted-foreground">管理您的账户设置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>更新您的个人信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">邮箱</label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">昵称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入昵称"
            />
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? '保存中...' : '保存更改'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>存储空间</CardTitle>
          <CardDescription>查看您的存储使用情况</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>已使用</span>
            <span className="font-medium">
              {formatBytes(user?.storageUsed || 0)} / {formatBytes(user?.storageQuota || 0)}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{storagePercent.toFixed(1)}% 已使用</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WebDAV 设置</CardTitle>
          <CardDescription>使用 WebDAV 客户端（如 Finder、Windows 资源管理器）直接访问您的文件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">WebDAV 地址</label>
            <div className="flex gap-2">
              <Input value={webdavUrl} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(webdavUrl);
                  toast({ title: '已复制 WebDAV 地址' });
                }}
              >
                复制
              </Button>
            </div>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground space-y-1">
            <p>• 用户名：您的登录邮箱</p>
            <p>• 密码：您的登录密码</p>
            <p>• 支持 macOS Finder、Windows 资源管理器、Cyberduck 等客户端</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
