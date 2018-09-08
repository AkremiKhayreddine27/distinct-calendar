import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-calendar-import-form',
  templateUrl: './calendar-import-form.component.html',
  styleUrls: ['./calendar-import-form.component.scss']
})
export class CalendarImportFormComponent implements OnInit {

  pageTitle = 'Import calendar';

  form: FormGroup;

  events: any[] = [];


  constructor(
    private dialogRef: MatDialogRef<CalendarImportFormComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {

  }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      color: new FormControl('red', Validators.required),
      display: new FormControl(true),
      url: new FormControl('')
    })
  }

  get name(): FormControl { return this.form.get('name') as FormControl }

  get description(): FormControl { return this.form.get('description') as FormControl }

  get color(): FormControl { return this.form.get('color') as FormControl }

  get url(): FormControl { return this.form.get('url') as FormControl }

  newEvents(events, calendarName) {
    this.form.patchValue({ name: calendarName });
    this.events = events;
  }

  save() {
    this.events.map(event => {
      event.calendar = this.form.value;
    })
    this.dialogRef.close({ calendar: this.form.value, events: this.events });
  }

  close() {
    this.dialogRef.close();
  }

}
