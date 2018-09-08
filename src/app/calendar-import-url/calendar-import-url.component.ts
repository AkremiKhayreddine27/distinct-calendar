import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CalendarService } from '../../../projects/locatus-calendar/src/public_api';

@Component({
  selector: 'app-calendar-import-url',
  templateUrl: './calendar-import-url.component.html',
  styleUrls: ['./calendar-import-url.component.scss']
})
export class CalendarImportUrlComponent implements OnInit {

  pageTitle = 'Import calendar';

  form: FormGroup;

  events: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<CalendarImportUrlComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private calendarService: CalendarService
  ) {

  }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      color: new FormControl('red', Validators.required),
      display: new FormControl(true),
      url: new FormControl('https://calendar.google.com/calendar/ical/kgmrsmhla9uhc1dpksbbhd3gbk%40group.calendar.google.com/private-36b72eb60593444e1789c7f7f2b63045/basic.ics', Validators.required)
    })
  }

  get name(): FormControl { return this.form.get('name') as FormControl }

  get description(): FormControl { return this.form.get('description') as FormControl }

  get color(): FormControl { return this.form.get('color') as FormControl }

  get url(): FormControl { return this.form.get('url') as FormControl }

  save() {
    if (this.form.valid) {
      this.calendarService.synchronize(this.url.value, this.form.value).subscribe(events => {
        this.events = events;
        this.events.map(event => {
          event.calendar = this.form.value;
        })
        this.dialogRef.close({ calendar: this.form.value, events: this.events });
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

}
