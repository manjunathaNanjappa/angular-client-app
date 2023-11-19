import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzUploadFile, NzUploadType } from 'ng-zorro-antd/upload';
import { ApplicationService } from 'src/app/services/application-service/application.service';
import { AuthService } from 'src/app/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {
  @ViewChild('applicationDetailsModalTempRef', { static: true })
  content!: TemplateRef<unknown>;

  applicationForm!: FormGroup;
  isDrawerVisible: boolean = false;
  listOfApplications: any[] = [];
  profilePicFileList: NzUploadFile[] = [];
  marksSheetFileList: NzUploadFile[] = [];
  isEditApplication: boolean = false;

  applicationModal: any;

  marksSheetFileType = 'application/pdf,image/jpg,image/jpeg';
  profilePicFileType = 'image/png,image/jpeg';

  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService,
    private nzMessageService: NzMessageService,
    private nzModalService: NzModalService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getAllApplicationList();
  }

  logOut() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openApplicationDrawer() {
    this.initApplicationForm();
    this.isDrawerVisible = true;
  }

  initApplicationForm() {
    this.applicationForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required, Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      profilePic: [null, [Validators.required]],
      marksSheet: [null, [Validators.required]],
    });
  }

  getAllApplicationList() {
    this.applicationService.getAllApplicationList().subscribe({
      next: (data) => {
        console.log('data', data);
        this.listOfApplications = [...data];
      },
      error: (err: any) => {
        console.log('err', err);
      },
    });
  }

  closeDrawer() {
    this.isDrawerVisible = false;
  }

  submitForm() {
    if (this.applicationForm.valid) {
      let formValue = this.applicationForm.value;
      this.applicationService.createNewApplication(formValue).subscribe({
        next: (data) => {
          console.log('data', data);

          this.listOfApplications.unshift({ ...data });
          this.listOfApplications = [...this.listOfApplications];
          this.nzMessageService.success('Application created successful');
        },
        error: (err: any) => {
          console.log('err', err);
          this.nzMessageService.error('Something went wrong');
        },
      });
      this.isDrawerVisible = false;
      this.applicationForm.reset();
    } else {
      Object.values(this.applicationForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  fileToBase64(file: any, fieldName: any) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.applicationForm.patchValue({
        [fieldName]: {
          file: reader.result as string,
          fileName: file.name,
          mimeType: file.type,
        },
      });
    };
  }

  onProfilePicChange(event: any) {
    if (event.target.files[0]) {
      let file = event.target.files[0];
      if (file.type == 'image/png' || file.type == 'image/jpeg') {
        this.fileToBase64(event.target.files[0], 'profilePic');
      }
    }
  }
  onMarksSheetChange(event: any) {
    if (event.target.files[0]) {
      let file = event.target.files[0];
      if (
        file.type == 'application/pdf' ||
        file.type == 'image/jpeg' ||
        file.type == 'image/jpg'
      ) {
        this.fileToBase64(event.target.files[0], 'marksSheet');
      }
    }
  }

  deleteApplication(applicationId: string) {
    console.log('applicationId', applicationId);
    this.applicationService.deleteApplication(applicationId).subscribe({
      next: (data) => {
        console.log('data', data);
        this.listOfApplications = this.listOfApplications.filter(
          (application) => {
            return application._id != applicationId;
          }
        );
      },
      error: (err: any) => {
        console.log('err', err);
      },
    });
  }

  openApplicationDetailsModal(applicationData: any) {
    this.applicationModal = this.nzModalService.create({
      nzTitle: 'Application Details',
      nzContent: this.content,
      nzFooter: null,
      nzData: applicationData,
    });
  }

  downloadFile(fileData: any) {
    let base64 = fileData.file.bufferData.toString('base64');
    console.log('base64', base64);
    const blob = new Blob([fileData.file], { type: fileData.mimeType });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileData.fileName;
    link.click();
  }

  editApplicationDetails(applicationData: any) {
    console.log('applicationData', applicationData);
    this.isEditApplication = true;
    this.openApplicationDrawer();
  }
}
