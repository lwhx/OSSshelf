import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFileStore } from '@/stores/auth';
import { filesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatBytes, formatDate, getFileExtension } from '@/utils';
import {
  Folder,
  File,
  Upload,
  FolderPlus,
  Grid,
  List,
  MoreVertical,
  Download,
  Trash2,
  Share2,
  Edit2,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function Files() {
  const { folderId } = useParams<{ folderId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { viewMode, setViewMode, selectedFiles, toggleFileSelection, clearSelection } = useFileStore();
  
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const { data: files, isLoading } = useQuery({
    queryKey: ['files', folderId],
    queryFn: () => filesApi.list({ parentId: folderId || null }).then((res) => res.data.data),
  });
  
  const createFolderMutation = useMutation({
    mutationFn: (name: string) => filesApi.createFolder(name, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', folderId] });
      setShowNewFolderDialog(false);
      setNewFolderName('');
      toast({ title: '创建成功', description: '文件夹已创建' });
    },
    onError: (error: any) => {
      toast({
        title: '创建失败',
        description: error.response?.data?.error?.message,
        variant: 'destructive',
      });
    },
  });
  
  const uploadMutation = useMutation({
    mutationFn: ({ file, parentId }: { file: File; parentId: string | null }) =>
      filesApi.upload(file, parentId, (progress) => setUploadProgress(progress)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', folderId] });
      setUploadProgress(null);
      toast({ title: '上传成功', description: '文件已上传' });
    },
    onError: (error: any) => {
      setUploadProgress(null);
      toast({
        title: '上传失败',
        description: error.response?.data?.error?.message,
        variant: 'destructive',
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', folderId] });
      toast({ title: '删除成功', description: '文件已删除' });
    },
    onError: (error: any) => {
      toast({
        title: '删除失败',
        description: error.response?.data?.error?.message,
        variant: 'destructive',
      });
    },
  });
  
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadMutation.mutate({ file, parentId: folderId || null });
      });
    },
    [folderId, uploadMutation]
  );
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });
  
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName.trim());
    }
  };
  
  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await filesApi.download(fileId);
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      toast({
        title: '下载失败',
        description: '文件下载失败',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div {...getRootProps()} className="space-y-6">
      <input {...getInputProps()} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">文件管理</h1>
          <p className="text-muted-foreground">管理您的文件和文件夹</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode('list')}>
            <List className={`h-4 w-4 ${viewMode === 'list' ? 'text-primary' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setViewMode('grid')}>
            <Grid className={`h-4 w-4 ${viewMode === 'grid' ? 'text-primary' : ''}`} />
          </Button>
          <Button onClick={() => setShowNewFolderDialog(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            新建文件夹
          </Button>
          <label>
            <Button asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                上传文件
              </span>
            </Button>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach((file) => {
                  uploadMutation.mutate({ file, parentId: folderId || null });
                });
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>
      
      {/* Upload progress */}
      {uploadProgress !== null && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">上传中...</span>
            <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Drag overlay */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 bg-primary/10 flex items-center justify-center pointer-events-none">
          <div className="bg-card border-2 border-dashed border-primary rounded-lg p-12">
            <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">拖放文件到此处上传</p>
          </div>
        </div>
      )}
      
      {/* New folder dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">新建文件夹</h2>
            <Input
              placeholder="文件夹名称"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
                取消
              </Button>
              <Button onClick={handleCreateFolder} disabled={createFolderMutation.isPending}>
                创建
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* File list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : files && files.length > 0 ? (
        viewMode === 'list' ? (
          <div className="bg-card border rounded-lg divide-y">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-4 p-4 hover:bg-accent/50 cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'bg-accent' : ''
                }`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <div className="flex-shrink-0">
                  {file.isFolder ? (
                    <Folder className="h-8 w-8 text-primary" />
                  ) : (
                    <File className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {file.isFolder ? '文件夹' : formatBytes(file.size)} · {formatDate(file.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!file.isFolder && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file.id, file.name);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(file.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className={`bg-card border rounded-lg p-4 hover:bg-accent/50 cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <div className="flex justify-center mb-3">
                  {file.isFolder ? (
                    <Folder className="h-12 w-12 text-primary" />
                  ) : (
                    <File className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium truncate text-center">{file.name}</p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {file.isFolder ? '文件夹' : formatBytes(file.size)}
                </p>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无文件</p>
          <p className="text-sm mt-1">拖放文件或点击上传按钮添加文件</p>
        </div>
      )}
    </div>
  );
}
