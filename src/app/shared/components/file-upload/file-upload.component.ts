import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  @Input() uploadType: 'profile' | 'assignment' = 'profile';
  @Input() accept = 'image/*,.pdf,.doc,.docx';
  @Input() multiple = false;
  @Output() uploaded = new EventEmitter<string[]>();
  
  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  fileInfos: any[] = [];

  constructor(
    private uploadService: FileUploadService, 
    private notificationService: NotificationService
  ) {}

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(): void {
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
      this.selectedFiles = undefined;

      if (file) {
        this.currentFile = file;
        this.progress = 0;

        this.uploadService.uploadFile(this.currentFile, this.uploadType).subscribe({
          next: (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progress = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpResponse) {
              this.message = 'Upload réussi!';
              const fileUrl = event.body.fileUrl;
              this.fileInfos.push({
                name: file.name,
                url: fileUrl
              });
              this.uploaded.emit(this.fileInfos.map(f => f.url));
              this.notificationService.success('Fichier uploadé avec succès');
            }
          },
          error: (err: any) => {
            this.progress = 0;
            this.message = 'Impossible d\'uploader le fichier!';
            this.currentFile = undefined;
            this.notificationService.error(err.message || 'Échec de l\'upload');
          }
        });
      }
    }
  }
}