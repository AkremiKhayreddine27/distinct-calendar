import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-calendar-form',
  templateUrl: './calendar-form.component.html',
  styleUrls: ['./calendar-form.component.scss']
})
export class CalendarFormComponent implements OnInit {

  pageTitle = 'Add calendar';

  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<CalendarFormComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {

  }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      color: new FormControl('', Validators.required),
      display: new FormControl(true),
    })
  }

  get name(): FormControl { return this.form.get('name') as FormControl }

  get description(): FormControl { return this.form.get('description') as FormControl }

  get color(): FormControl { return this.form.get('color') as FormControl }

  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }

}
