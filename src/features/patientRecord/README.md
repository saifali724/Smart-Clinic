# Patient Record screen (Figma 02)

Route: `/patientrecord` (log in first, it's a protected page).

## Where the data comes from

| On screen | Comes from |
|---|---|
| Name, ID, father name, DOB, age, gender | CNIC scan → `patients/{PT-xxxx}` |
| "Active" badge | always shown while the record is open |
| Other badges (Hypertensive, Diabetic…) | `diagnoses` of the patient's **last** visit; hidden on a first visit |
| Last Visit date | the last visit's `date`; hidden on a first visit |
| Doctor name — specialization | the doctor who is **logged in** (`users/{uid}`) |
| Personal Information | `patients/{PT-xxxx}` — doctor types the empty ones, each saves when you leave the box |
| Vitals | **live** from `patients/{PT-xxxx}/vitals/live` (sensors write here) |
| Current Medications | `patients/{PT-xxxx}/medications` where `active` is not `false` |
| Visit History | `patients/{PT-xxxx}/visits`, newest first (today's visit not included) |

New CNIC → new permanent ID (`PT-0001`, `PT-0002`, …).
Same CNIC again → the **same** ID, so all old visits, medicines and badges come back.

## Connecting the sensors later

Each sensor writes its newest reading into **one document**:

```
patients/{patientId}/vitals/live
{
  bloodPressure: { systolic: 142, diastolic: 88, updatedAt: <time> },
  heartRate:     { value: 78,   updatedAt: <time> },
  glucose:       { value: 126,  updatedAt: <time> },
  spo2:          { value: 97,   updatedAt: <time> },
  temperature:   { value: 98.6, updatedAt: <time> },   // °F
  weight:        { value: 82,   updatedAt: <time> },   // kg
  height:        { value: 176 }                        // cm (optional → BMI)
}
```

To know which patient is on the machine, read `devices/current` → `{ patientId }`.
The screen sets this every time a record opens.

From JavaScript (e.g. a small Node/Raspberry Pi bridge) one reading is:

```js
import { writeVitalReading } from "./services/vitalsService";
writeVitalReading("PT-0001", "heartRate", { value: 78 });
```

A reading shows **Live** for 30 seconds, after that "2m ago", and
"Waiting for sensor" if that sensor has never sent anything.

## Testing without sensors

Run `npm run dev`, open a record, and add `?simulate=1` to the address:
`http://localhost:5173/patientrecord?simulate=1`
Fake readings are written into the same document the real sensors will use.
This only works in development, never in a real build.
