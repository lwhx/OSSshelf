import { useAuthStore } from '@/stores/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatBytes } from '@/utils';
import { useState } from 'react';

export default function Settings() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState(user?.name || '');
  
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
          <Button>保存更改</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>存储空间</CardTitle>
          <CardDescription>查看您的存储使用情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>已使用</span>
              <span className="font-medium">
                {formatBytes(user?.storageUsed || 0)} / {formatBytes(user?.storageQuota || 0)}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${((user?.storageUsed || 0) / (user?.storageQuota || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>WebDAV 设置</CardTitle>
          <CardDescription>使用 WebDAV 客户端访问您的文件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">WebDAV 地址</label>
            <Input
              value={`${window.location.origin}/dav`}
              readOnly
            />
          </div>
          <p className="text-sm text-muted-foreground">
            使用您的邮箱和密码作为 WebDAV 客户端的登录凭据
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
