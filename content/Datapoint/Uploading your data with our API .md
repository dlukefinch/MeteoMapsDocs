# DataPoint API Integration Guides

---

## Method 1 — Direct HTTP / REST API

Push data to DataPoint from any HTTP client (curl, Postman, Python, etc.).

**Endpoint**

```
POST https://datapoint.meteomaps.com/functions/v1/ingest-dataset
```

**Headers**

```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

---

### Step 1 — Obtain your session token

Sign in to DataPoint in your browser. Open developer tools (`F12` on Windows / `Cmd+Option+I` on Mac) and go to **Application → Local Storage**. Click the entry containing `supabase` and locate the key ending in `auth-token`. Its value is a JSON object — copy the `access_token` string from inside it.

> **Note:** Tokens expire after approximately 1 hour. For scheduled scripts, use the `refresh_token` to obtain a new `access_token` before each request via the Supabase Auth REST API (`POST /auth/v1/token?grant_type=refresh_token`).

---

### Step 2 — Prepare your JSON request body

Construct a JSON object with the fields below. `name` and `rows` are required. Each object in `rows` must include a `Year` field (integer). Monthly columns follow the pattern `MM_max`, `MM_min`, `MM_rain` where `MM` is the zero-padded month number (`01`–`12`). Columns without data can be omitted.

```json
{
  "name": "My Station 2024",
  "description": "Optional description",
  "is_public": true,
  "rows": [
    {
      "Year": 2023,
      "01_max": 8.2, "01_min": 2.1, "01_rain": 62.4,
      "06_max": 21.0, "06_min": 11.5, "06_rain": 38.0
    },
    {
      "Year": 2024,
      "01_max": 7.9, "01_min": 1.8, "01_rain": 58.0
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Dataset title shown in the Directory |
| `description` | string | No | Optional description |
| `is_public` | boolean | No | Whether others can view it. Defaults to `true` |
| `rows` | array | Yes | Array of row objects, each with a `Year` field |

---

### Step 3 — Send the POST request

```bash
curl -X POST "https://datapoint.meteomaps.com/functions/v1/ingest-dataset" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Station 2024",
    "is_public": true,
    "rows": [{"Year": 2023, "07_max": 24.3, "07_min": 13.8}]
  }'
```

---

### Step 4 — Read the response

On success the API returns HTTP 200 with:

```json
{
  "success": true,
  "dataset": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Station 2024",
    "rowCount": 2,
    "columnCount": 4,
    "isPublic": true,
    "createdAt": "2024-07-15T10:30:00Z"
  }
}
```

On error, the response includes an `error` field describing what went wrong.

---

### Step 5 — Verify in DataPoint

Log in to DataPoint and open the Directory. Your new dataset appears at the top of the list under your account. Click it to open the Dataset Viewer and confirm the data looks correct.

---

---

## Method 2 — Excel VBA Macro

Uploads the active Excel sheet directly from desktop Excel (Windows). No add-ins or extra licencing required.

---

### Step 1 — Enable the Developer tab

Click **File → Options → Customize Ribbon**. In the right-hand "Main Tabs" list, tick **Developer** and click **OK**. This is a one-time step.

---

### Step 2 — Obtain your session token

Sign in to DataPoint in your browser. Press `F12`, go to **Application → Local Storage**, click the Supabase entry, and copy the `access_token` value from the JSON object stored there.

> **Note:** Tokens expire after ~1 hour. If the macro returns an authentication error, re-copy a fresh token from the browser.

---

### Step 3 — Open the Visual Basic Editor

Press `Alt + F11` (or click **Developer → Visual Basic** in the ribbon). The VBA editor opens in a new window.

---

### Step 4 — Insert a new module

In the Project panel on the left, right-click your workbook name and choose **Insert → Module**. A blank code window opens.

---

### Step 5 — Paste the macro

Click inside the blank module and paste the following code:

```vba
Sub PushToDataPoint()
    Dim TOKEN As String
    TOKEN = "YOUR_ACCESS_TOKEN_HERE" ' replace with your access_token

    Dim ws As Worksheet
    Set ws = ActiveSheet

    Dim lastRow As Long
    Dim lastCol As Long
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    lastCol = ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column

    Dim headers() As String
    ReDim headers(1 To lastCol)
    Dim c As Long
    For c = 1 To lastCol
        headers(c) = CStr(ws.Cells(1, c).Value)
    Next c

    Dim rowsJson As String
    rowsJson = "["
    Dim r As Long
    For r = 2 To lastRow
        Dim rowJson As String
        rowJson = "{"
        Dim firstField As Boolean
        firstField = True
        For c = 1 To lastCol
            Dim cellVal As Variant
            cellVal = ws.Cells(r, c).Value
            If cellVal <> "" Then
                If Not firstField Then rowJson = rowJson & ","
                Dim valStr As String
                If IsNumeric(cellVal) Then
                    valStr = CStr(cellVal)
                Else
                    valStr = Chr(34) & Replace(CStr(cellVal), Chr(34), "\" & Chr(34)) & Chr(34)
                End If
                rowJson = rowJson & Chr(34) & headers(c) & Chr(34) & ":" & valStr
                firstField = False
            End If
        Next c
        rowJson = rowJson & "}"
        If r > 2 Then rowsJson = rowsJson & ","
        rowsJson = rowsJson & rowJson
    Next r
    rowsJson = rowsJson & "]"

    Dim sheetName As String
    sheetName = Replace(ws.Name, Chr(34), "'")
    Dim payload As String
    payload = "{" & _
        Chr(34) & "name" & Chr(34) & ":" & Chr(34) & sheetName & " Export" & Chr(34) & "," & _
        Chr(34) & "description" & Chr(34) & ":" & Chr(34) & "Exported from Excel" & Chr(34) & "," & _
        Chr(34) & "is_public" & Chr(34) & ":true," & _
        Chr(34) & "rows" & Chr(34) & ":" & rowsJson & _
        "}"

    Dim http As Object
    Set http = CreateObject("MSXML2.XMLHTTP")
    http.Open "POST", "https://datapoint.meteomaps.com/functions/v1/ingest-dataset", False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "Authorization", "Bearer " & TOKEN
    http.send payload

    If http.Status = 200 Or http.Status = 201 Then
        MsgBox "Upload successful!", vbInformation, "DataPoint"
    Else
        MsgBox "Upload failed." & vbCrLf & "Status: " & http.Status & vbCrLf & http.responseText, vbCritical, "DataPoint"
    End If
End Sub
```

---

### Step 6 — Replace the token placeholder

On line 2, replace `YOUR_ACCESS_TOKEN_HERE` (keep the surrounding quotes) with the token you copied in step 2.

---

### Step 7 — Prepare your sheet

Row 1 must be a header row. The year column header must be exactly `Year`. Monthly columns should follow the `MM_max`, `MM_min`, `MM_rain` naming convention. Data rows start from row 2. Click the sheet tab containing your data to make it the active sheet.

---

### Step 8 — Run the macro

Press `Alt + F11` to open the VBA editor (or go back if it is still open). Click anywhere inside the `PushToDataPoint` sub and press `F5`, or use **Developer → Macros → PushToDataPoint → Run** from the ribbon.

> **Note:** If Excel shows a security prompt about connecting to an external URL, click **Allow**.

A dialog confirms success or shows the error message from the server.

---

---

## Method 3 — Power Automate (Microsoft 365)

> **Licence required:** The HTTP connector used in this method is only available on **Power Automate Premium** (per-user or per-flow) plans. It is not available on the free tier or the basic plan included with standard Microsoft 365 subscriptions. Confirm your licencing before proceeding.

---

### Step 1 — Obtain your session token

Sign in to DataPoint in your browser. Press `F12`, go to **Application → Local Storage**, click the Supabase entry, and copy the `access_token` value.

> **Note:** Tokens expire after ~1 hour. For scheduled flows, you will need to refresh the token periodically.

---

### Step 2 — Create a new flow

Go to [make.powerautomate.com](https://make.powerautomate.com) and sign in. Click **Create**, then choose **Instant cloud flow** (to trigger manually) or **Scheduled cloud flow** (for recurring uploads). Name the flow and click **Create**.

---

### Step 3 — Add an Initialize variable action

Click **+ New step** and search for **Initialize variable** (Variables connector). Set:

- **Name** → `token`
- **Type** → String
- **Value** → paste your `access_token`

---

### Step 4 — Build the rows data with a Compose action

Add a **Compose** action (Data Operation connector). In the **Inputs** field, enter your rows array as a JSON expression. If your data comes from an Excel table, use a **Select** action first to shape each row into the correct format, then reference its output here.

```json
[
  {
    "Year": 2023,
    "01_max": 8.2, "01_min": 2.1, "01_rain": 62.4,
    "07_max": 24.3, "07_min": 13.8, "07_rain": 38.2
  },
  {
    "Year": 2024,
    "01_max": 7.9, "01_min": 1.8, "01_rain": 58.0
  }
]
```

---

### Step 5 — Add an HTTP action

Add a new step and search for **HTTP** (Premium connectors). Configure as follows:

```
Method:   POST
URI:      https://datapoint.meteomaps.com/functions/v1/ingest-dataset

Headers:
  Authorization:   Bearer @{variables('token')}
  Content-Type:    application/json

Body:
  {
    "name": "My Flow Export",
    "description": "Automated upload from Power Automate",
    "is_public": true,
    "rows": @{outputs('Compose')}
  }
```

In the Body field, use the dynamic content picker to reference the **Compose** output for the `rows` value.

---

### Step 6 — Parse the response (optional)

Add a **Parse JSON** action (Data Operation connector). Set **Content** to the **Body** output of the HTTP action. Click **Generate from sample** and paste this example response:

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "dataset": {
      "type": "object",
      "properties": {
        "id":          { "type": "string" },
        "name":        { "type": "string" },
        "rowCount":    { "type": "integer" },
        "columnCount": { "type": "integer" },
        "isPublic":    { "type": "boolean" },
        "createdAt":   { "type": "string" }
      }
    }
  }
}
```

This makes the dataset fields available as dynamic content in subsequent actions.

---

### Step 7 — Test and save

Click **Save**, then click **Test → Manually → Test**. Power Automate runs the flow and shows a tick or error on each action. Expand the HTTP action to confirm the dataset ID in the response body.

> **Tip:** Add a **Send an email** or **Post a Teams message** action after the HTTP step to notify your team when an upload succeeds.

---

---

## Method 4 — Google Apps Script (Google Sheets)

Free and built into every Google Sheet. No extensions or billing required.

---

### Step 1 — Open the Apps Script editor

Open the Google Sheet containing your data. Click **Extensions → Apps Script**. The editor opens in a new tab. If you see a default `myFunction`, delete it.

---

### Step 2 — Obtain your session token

In another browser tab, sign in to DataPoint. Press `F12`, go to **Application → Local Storage**, click the Supabase entry, and copy the `access_token` value.

> **Note:** Tokens expire after ~1 hour. If the script returns a 401 Unauthorized error, copy a fresh token from the browser.

---

### Step 3 — Paste the script

Replace all content in `Code.gs` with the following:

```javascript
function pushToDataPoint() {
  var TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; // replace with your token

  var payload = {
    name: 'My Sheet Export - ' + new Date().toLocaleDateString(),
    description: 'Automated export from Google Sheets',
    is_public: true,
    rows: buildRowsFromSheet()
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + TOKEN },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(
    'https://datapoint.meteomaps.com/functions/v1/ingest-dataset',
    options
  );
  var result = JSON.parse(response.getContentText());

  if (result.success) {
    SpreadsheetApp.getUi().alert(
      'Upload successful!\n' +
      result.dataset.rowCount + ' rows uploaded.\n' +
      'Dataset ID: ' + result.dataset.id
    );
  } else {
    SpreadsheetApp.getUi().alert('Upload failed: ' + result.error);
  }
}

function buildRowsFromSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      if (data[i][j] !== '') {
        row[headers[j]] = data[i][j];
      }
    }
    if (Object.keys(row).length > 0) {
      rows.push(row);
    }
  }

  return rows;
}
```

---

### Step 4 — Replace the token placeholder

On line 2, replace `YOUR_ACCESS_TOKEN_HERE` (keep the surrounding single quotes) with the token you copied in step 2.

---

### Step 5 — Prepare your spreadsheet

Row 1 must be a header row. The year column header must be exactly `Year`. Monthly columns should follow the `MM_max`, `MM_min`, `MM_rain` convention. Data starts from row 2. Empty cells are skipped automatically — you do not need to fill every column for every year.

---

### Step 6 — Save and run

Press `Ctrl+S` (`Cmd+S` on Mac) to save. Confirm the function dropdown next to the **Run** button says `pushToDataPoint`, then click **Run** (or press `Ctrl+R`).

---

### Step 7 — Authorise the script

The first time you run the script, Google asks for permission. Click **Review permissions**, select your account, click **Advanced → Go to [script name] (unsafe)** (this warning is normal for scripts you wrote yourself), then click **Allow**. The authorisation is remembered for future runs.

> **Note:** The script only requests permission for `UrlFetchApp` (to call the DataPoint API) and `SpreadsheetApp.getUi` (to show the result dialog).

---

### Step 8 — Confirm the result

Switch back to your Google Sheet tab. A dialog appears showing the number of rows uploaded and the dataset ID. Open DataPoint and check the Directory to find your new dataset.
