/**
 * Tasks.tsx
 * 上传任务管理页面
 *
 * 功能:
 * - 查看上传任务列表
 * - 断点续传管理
 * - 任务状态监控
 */

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/services/api';
import { presignUpload } from '@/services/presignUpload';
import type { UploadTask } from '@osshelf/shared';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatBytes, formatDate } from '@/utils';
import { cn } from '@/utils';
import {
  Upload,
  Trash2,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Pause,
  Play,
  AlertTriangle,
  FileText,
  RotateCcw,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: '等待中', color: 'text-amber-500', icon: Clock },
  uploading: { label: '上传中', color: 'text-blue-500', icon: Loader2 },
  paused: { label: '已暂停', color: 'text-orange-500', icon: AlertTriangle },
  completed: { label: '已完成', color: 'text-emerald-500', icon: CheckCircle2 },
  failed: { label: '失败', color: 'text-red-500', icon: XCircle },
  expired: { label: '已过期', color: 'text-muted-foreground', icon: XCircle },
};

const DEFAULT_STATUS = { label: '未知', color: 'text-muted-foreground', icon: Clock };

export default function Tasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resumingTaskId, setResumingTaskId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list().then((r) => r.data.data ?? []),
    refetchInterval: 5000,
  });

  const abortMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.abort(taskId),
    onSuccess: () => {
      toast({ title: '任务已取消' });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (e: any) =>
      toast({
        title: '取消失败',
        description: e.response?.data?.error?.message,
        variant: 'destructive',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(taskId),
    onSuccess: () => {
      toast({ title: '任务已删除' });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (e: any) =>
      toast({
        title: '删除失败',
        description: e.response?.data?.error?.message,
        variant: 'destructive',
      }),
  });

  const pauseMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.pause(taskId),
    onSuccess: () => {
      toast({ title: '任务已暂停' });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (e: any) =>
      toast({
        title: '暂停失败',
        description: e.response?.data?.error?.message,
        variant: 'destructive',
      }),
  });

  const resumeMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.resume(taskId),
    onSuccess: () => {
      toast({ title: '任务已恢复' });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (e: any) =>
      toast({
        title: '恢复失败',
        description: e.response?.data?.error?.message,
        variant: 'destructive',
      }),
  });

  const handleResumeUpload = async (task: UploadTask) => {
    setResumingTaskId(task.id);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, tasks: UploadTask[]) => {
    const file = event.target.files?.[0];
    if (!file || !resumingTaskId) return;

    const task = tasks.find((t) => t.id === resumingTaskId);
    if (!task) {
      toast({ title: '任务不存在', variant: 'destructive' });
      setResumingTaskId(null);
      return;
    }

    // 验证文件大小是否匹配
    if (file.size !== task.fileSize) {
      toast({
        title: '文件大小不匹配',
        description: `请选择相同大小的文件（${formatBytes(task.fileSize)}）`,
        variant: 'destructive',
      });
      setResumingTaskId(null);
      return;
    }

    // 验证文件名是否匹配
    if (file.name !== task.fileName) {
      toast({
        title: '文件名不匹配',
        description: `请选择名为 "${task.fileName}" 的文件`,
        variant: 'destructive',
      });
      setResumingTaskId(null);
      return;
    }

    try {
      toast({ title: '正在恢复上传...', description: '请勿关闭此页面' });

      await presignUpload({
        file,
        parentId: task.parentId,
        bucketId: task.bucketId,
        taskId: task.id,
        skipParts: task.uploadedParts,
        onProgress: (percent) => {
          console.log(`上传进度: ${percent}%`);
        },
      });

      toast({ title: '上传完成', description: task.fileName });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error: any) {
      toast({
        title: '上传失败',
        description: error.message || '未知错误',
        variant: 'destructive',
      });
    } finally {
      setResumingTaskId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const activeTasks = tasks.filter((t) => t.status === 'uploading' || t.status === 'pending' || t.status === 'paused');
  const completedTasks = tasks.filter(
    (t) => t.status === 'completed' || t.status === 'failed' || t.status === 'expired'
  );

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, tasks)}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">上传任务</h1>
          <p className="text-muted-foreground text-sm mt-0.5">管理大文件上传任务</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          刷新
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {activeTasks.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">进行中的任务</CardTitle>
                    <CardDescription>{activeTasks.length} 个任务正在处理</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onAbort={() => abortMutation.mutate(task.id)}
                      onDelete={() => deleteMutation.mutate(task.id)}
                      onPause={() => pauseMutation.mutate(task.id)}
                      onResume={() => resumeMutation.mutate(task.id)}
                      onResumeUpload={() => handleResumeUpload(task)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">历史任务</CardTitle>
                  <CardDescription>已完成或失败的任务</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">暂无历史任务</div>
              ) : (
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onDelete={() => deleteMutation.mutate(task.id)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {tasks.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">暂无上传任务</p>
              <p className="text-sm mt-1">上传大文件时会自动创建任务</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TaskItem({
  task,
  onAbort,
  onDelete,
  onPause,
  onResume,
  onResumeUpload,
}: {
  task: UploadTask;
  onAbort?: () => void;
  onDelete: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onResumeUpload?: () => void;
}) {
  const status = STATUS_CONFIG[task.status] ?? DEFAULT_STATUS;
  const progress = task.totalParts > 0 ? Math.round((task.uploadedParts.length / task.totalParts) * 100) : 0;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          task.status === 'uploading' ? 'bg-blue-500/10' : task.status === 'paused' ? 'bg-orange-500/10' : 'bg-muted'
        )}
      >
        <FileText
          className={cn(
            'h-5 w-5',
            task.status === 'uploading'
              ? 'text-blue-500'
              : task.status === 'paused'
                ? 'text-orange-500'
                : 'text-muted-foreground'
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{task.fileName}</span>
          <span className={cn('flex items-center gap-1 text-xs', status.color)}>
            <StatusIcon className={cn('h-3 w-3', task.status === 'uploading' && 'animate-spin')} />
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span>{formatBytes(task.fileSize)}</span>
          <span>
            {task.uploadedParts.length} / {task.totalParts} 分片
          </span>
          <span>{formatDate(task.createdAt)}</span>
        </div>
        {(task.status === 'uploading' || task.status === 'pending' || task.status === 'paused') && (
          <div className="mt-2">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all', task.status === 'paused' ? 'bg-orange-500' : 'bg-primary')}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
          </div>
        )}
        {task.errorMessage && <p className="text-xs text-red-500 mt-1">{task.errorMessage}</p>}
      </div>

      <div className="flex items-center gap-1">
        {task.status === 'uploading' && onPause && (
          <Button variant="outline" size="sm" onClick={onPause}>
            <Pause className="h-3.5 w-3.5 mr-1" />
            暂停
          </Button>
        )}
        {task.status === 'pending' && onPause && (
          <Button variant="outline" size="sm" onClick={onPause}>
            <Pause className="h-3.5 w-3.5 mr-1" />
            暂停
          </Button>
        )}
        {task.status === 'paused' && onResume && (
          <Button variant="outline" size="sm" onClick={onResume}>
            <Play className="h-3.5 w-3.5 mr-1" />
            恢复
          </Button>
        )}
        {task.status === 'paused' && progress > 0 && onResumeUpload && (
          <Button variant="outline" size="sm" onClick={onResumeUpload}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            继续上传
          </Button>
        )}
        {task.status === 'uploading' && onAbort && (
          <Button variant="outline" size="sm" onClick={onAbort}>
            <XCircle className="h-3.5 w-3.5 mr-1" />
            取消
          </Button>
        )}
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
