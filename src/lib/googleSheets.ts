import { google } from "googleapis";

/**
 * Initializes and returns the authenticated Google Sheets API client.
 */
function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google Sheets API credentials in environment variables.");
  }

  // Environment variables sometimes escape newline characters or have extra quotes.
  privateKey = privateKey.replace(/\\n/g, "\n").replace(/^"|"$/g, "").trim();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Interface representing a student's check-in status for a session.
 */
interface SyncRecord {
  rollNo: string;
  name: string;
  email: string;
  status: "PRESENT" | "ABSENT";
}

/**
 * Appends attendance records to the Google Sheet in a matrix format.
 * @param sessionDate The formatted date string of the session.
 * @param records Array of student records to sync.
 */
export async function syncSessionToSheet(sessionDate: string, records: SyncRecord[]) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    console.error("Missing GOOGLE_SHEET_ID in environment variables. Cannot sync to sheets.");
    return false;
  }

  const sheetName = "Attendance Matrix";

  try {
    const sheets = getSheetsClient();

    // 1. Ensure the sheet exists and get existing data
    let existingValues: any[][] = [];
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName,
      });
      existingValues = response.data.values || [];
    } catch (error: any) {
      if (error?.message?.includes("Unable to parse range")) {
        // Sheet doesn't exist, create it
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title: sheetName },
                },
              },
            ],
          },
        });
      } else {
        throw error; // Re-throw if it's a different error
      }
    }

    // 2. Initialize matrix
    let matrix = [...existingValues];
    if (matrix.length === 0) {
      matrix.push(["Name", "Roll no"]); // Header row
    }

    let headers = matrix[0];

    // 3. Find or add the sessionDate column
    let dateColIndex = headers.indexOf(sessionDate);
    if (dateColIndex === -1) {
      headers.push(sessionDate);
      dateColIndex = headers.length - 1;
    }

    // 4. Map existing students by Roll no (Column index 1)
    const rollNoRowIndexMap = new Map<string, number>();
    for (let i = 1; i < matrix.length; i++) {
      const row = matrix[i];
      const rollNo = row[1];
      if (rollNo) {
        rollNoRowIndexMap.set(rollNo.toString().trim(), i);
      }
    }

    // 5. Process records
    for (const record of records) {
      const rollNoStr = record.rollNo.toString().trim();
      let rowIndex = rollNoRowIndexMap.get(rollNoStr);

      if (rowIndex !== undefined) {
        // Existing student, pad row if necessary
        const row = matrix[rowIndex];
        while (row.length <= dateColIndex) {
          row.push("");
        }
        row[dateColIndex] = record.status;
      } else {
        // New student
        const newRow = [record.name, record.rollNo];
        while (newRow.length < dateColIndex) {
          newRow.push("");
        }
        newRow.push(record.status); // This will be placed at dateColIndex
        matrix.push(newRow);
        rollNoRowIndexMap.set(rollNoStr, matrix.length - 1);
      }
    }

    // 6. Write the entire matrix back to the sheet
    // We use update with USER_ENTERED to properly format text/numbers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetName,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: matrix,
      },
    });

    console.log(`Successfully synced ${records.length} records to Google Sheets (Matrix format) for session: ${sessionDate}`);
    return true;
  } catch (error: any) {
    console.error("Failed to sync records to Google Sheets:", error?.message || error);
    return false;
  }
}
