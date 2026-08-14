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
 * Appends attendance records to the Google Sheet.
 * @param sessionDate The formatted date string of the session.
 * @param records Array of student records to append.
 */
export async function syncSessionToSheet(sessionDate: string, records: SyncRecord[]) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    console.error("Missing GOOGLE_SHEET_ID in environment variables. Cannot sync to sheets.");
    return false;
  }

  try {
    const sheets = getSheetsClient();

    // Prepare rows for Google Sheets: [Date, Roll No, Name, Email, Status]
    const rows = records.map((record) => [
      sessionDate,
      record.rollNo,
      record.name,
      record.email,
      record.status,
    ]);

    // Append to the first available sheet (Sheet1)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:E", // Adjust this if the sheet name is different
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });

    console.log(`Successfully synced ${records.length} records to Google Sheets for session: ${sessionDate}`);
    return true;
  } catch (error: any) {
    console.error("Failed to sync records to Google Sheets:", error?.message || error);
    // We do not throw the error because we don't want to break the main application flow if Sheets fails.
    return false;
  }
}
