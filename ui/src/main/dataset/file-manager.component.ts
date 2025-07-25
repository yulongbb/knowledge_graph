import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss'],
})
export class FileManagerComponent implements OnInit {
  folders: any[] = [];
  files: any[] = [];
  selectedFolder: string = '';
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadFolders();
    this.clearSelection(); // 初始化时显示根目录文件
  }

  // 加载根目录文件夹，目录树添加根节点，根节点默认展开
  loadFolders() {
    this.http.get<any[]>('/api/minio-client/folders').subscribe(tree => {
      // 添加根节点，根节点默认展开，下级目录也默认展开
      if (tree && tree.length > 0) {
        tree.forEach(node => node.expanded = true);
      }
      this.folders = [{
        label: '根目录',
        id: '',
        expanded: true,
        children: tree ?? []
      }];
    });
  }


  onFolderSelect(folder: any) {
    if (folder) {
      this.selectedFolder = folder.id;
      this.loadFiles(folder.id);
    }
  }

  // 新增：当未选中任何文件夹时，显示根目录下的文件
  clearSelection() {
    this.selectedFolder = '';
    this.loadFiles('');
  }

  loadFiles(folder: string) {
    this.loading = true;
    this.http.get<any[]>(`/api/minio-client/files?folder=${folder}`).subscribe(files => {
      if (folder) {
        this.files = files.filter(f =>
          typeof f.name === 'string' &&
          f.name.startsWith(folder + '/') &&
          !f.name.substring(folder.length + 1).includes('/')
        );
      } else {
        this.files = files.filter(f =>
          typeof f.name === 'string' &&
          !f.name.includes('/')
        );
      }
      this.loading = false;
    });
  }

  uploadFile(event: any) {
    // 省略上传实现，可用 x-upload 组件
  }

  deleteFile(file: any) {
    this.http.delete(`/api/minio-client/deleteFile/${file.name}`).subscribe(() => {
      this.loadFiles(this.selectedFolder);
    });
  }

  moveFile(file: any, newFolder: string) {
    this.http.post(`/api/minio-client/moveFile?oldName=${file.name}&newFolder=${newFolder}`, {}).subscribe(() => {
      this.loadFiles(this.selectedFolder);
    });
  }

  // buildTree 方法可保留，但实际已不再需要，后端已返回树结构
  // 将文件夹列表转为树结构（根据文件名自动生成多级目录树）
  buildTree(folders: string[]): any[] {
    // 支持传入文件名列表，自动生成目录树
    const root: any = {};
    for (const folder of folders) {
      // 支持文件名，如 demo/123/Dockerfile，demo/驱逐舰.numbers
      const parts = folder.split('/');
      // 如果最后一段不是文件夹（没有扩展名），则只作为目录
      // 这里假设所有传入都是文件夹路径（如 demo/123），否则只取目录部分
      // 但如果传入的是文件名，则只处理目录部分
      // 例如 demo/123/Dockerfile => demo/123
      if (parts.length > 1 && !folder.endsWith('/')) {
        parts.pop(); // 移除文件名部分
      }
      let node = root;
      for (const part of parts) {
        if (!node[part]) node[part] = {};
        node = node[part];
      }
    }
    function toTree(obj: any, parentPath = ''): any[] {
      return Object.keys(obj).map(key => {
        const fullPath = parentPath ? `${parentPath}/${key}` : key;
        return {
          label: key,
          id: fullPath,
          children: toTree(obj[key], fullPath)
        };
      });
    }
    return toTree(root);
  }
}