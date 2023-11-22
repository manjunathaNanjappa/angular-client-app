import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzUploadFile, NzUploadType } from 'ng-zorro-antd/upload';
import { ApplicationService } from 'src/app/services/application-service/application.service';
import { AuthService } from 'src/app/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import * as XLSX from 'xlsx';

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

  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();

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
    console.log('fileData', fileData);
    const downloadLink = document.createElement('a');
    downloadLink.href = fileData.file;
    downloadLink.download = fileData.fileName;
    downloadLink.click();
  }

  editApplicationDetails(applicationData: any) {
    console.log('applicationData', applicationData);
    this.isEditApplication = true;
    this.openApplicationDrawer();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfApplications.every((item) =>
      this.setOfCheckedId.has(item._id)
    );
    this.indeterminate =
      this.listOfApplications.some((item) =>
        this.setOfCheckedId.has(item._id)
      ) && !this.checked;
  }

  onAllChecked(value: boolean): void {
    this.listOfApplications.forEach((item) =>
      this.updateCheckedSet(item._id, value)
    );
    this.refreshCheckedStatus();
  }

  updateCheckedSet(id: any, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: any, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onClickExport() {
    let selectedApplications = this.listOfApplications.filter((application) => {
      if (this.setOfCheckedId.has(application._id)) {
        delete application.profilePic;
        delete application.marksSheet;
        delete application.createdBy;
        delete application.createdAt;
        return application;
      }
    });
    let timeSpan = new Date().toString();
    let fileName = `Applications-${timeSpan}`;

    let workBook = XLSX.utils.book_new();
    let workSheet = XLSX.utils.json_to_sheet(selectedApplications);
    XLSX.utils.book_append_sheet(workBook, workSheet, 'applications');
    XLSX.writeFile(workBook, `${fileName}.xlsx`);
  }
}
