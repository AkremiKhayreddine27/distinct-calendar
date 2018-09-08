import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import * as dateFns from 'date-fns';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {

  pageTitle = 'Add event';

  event: any;

  calendars: any[];

  hours: any[] = [];

  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<EventFormComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.event = data.event;
    this.calendars = data.calendars;
  }

  ngOnInit() {
    this.setHours();
    if (this.event) {
      this.pageTitle = 'Edit event'
    }
    this.form = new FormGroup({
      title: new FormControl(this.event && this.event.title ? this.event.title : null, Validators.required),
      description: new FormControl(this.event && this.event.description ? this.event.description : null, Validators.required),
      start: new FormControl(this.event && this.event.start ? this.event.start : null, Validators.required),
      end: new FormControl(this.event && this.event.end ? this.event.end : null, Validators.required),
      color: new FormControl(this.event && this.event.color ? this.event.color : null, Validators.required),
      calendar: new FormControl(this.event && this.event.calendar ? this.event.calendar : null, Validators.required),
      draggable: new FormControl(true)
    })
  }

  setHours() {
    for (let hour = dateFns.startOfDay(new Date()); hour < dateFns.endOfDay(new Date()); hour = dateFns.addMinutes(hour, 30)) {
      this.hours.push({
        hour: dateFns.getHours(hour) < 10 ? '0' + dateFns.getHours(hour) : dateFns.getHours(hour),
        minutes: dateFns.getMinutes(hour) < 10 ? '0' + dateFns.getMinutes(hour) : dateFns.getMinutes(hour),
      })
    }
  }

  get calendar(): FormControl { return this.form.get('calendar') as FormControl }

  get title(): FormControl { return this.form.get('title') as FormControl }

  get description(): FormControl { return this.form.get('description') as FormControl }

  get start(): FormControl { return this.form.get('start') as FormControl }

  get end(): FormControl { return this.form.get('end') as FormControl }

  get color(): FormControl { return this.form.get('color') as FormControl }

  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }

  delete() {
    this.dialogRef.close({ delete: true });
  }
}
