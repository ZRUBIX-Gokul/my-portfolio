"use server";

import { google } from "googleapis";

// Function to append a new ticket row to Google Sheets
export async function addTicketToSheet(ticketData) {
  try {
    // 1. Check Credentials
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Fix newlines in env vars
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
      console.log("⚠️ Google Sheets Credentials Missing in .env.local");
      return { success: false, error: "Credentials missing" };
    }

    // 2. Authenticate
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const googleSheets = google.sheets({ version: "v4", auth });

    // 3. Prepare Data Row
    // Columns: Ticket No, Date, Requester, Department, Target Dept, Priority, Description, Status
    const rowValues = [
      ticketData.ticketNo,
      ticketData.ticketDate,
      ticketData.requestedBy,
      ticketData.department,
      ticketData.toDept,
      ticketData.priority,
      ticketData.description,
      ticketData.status,
      new Date().toLocaleString() // Timestamp of entry
    ];

    // 4. Append to Sheet
    await googleSheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:I", // Appends to Sheet1, Columns A to I
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowValues],
      },
    });

    return { success: true };

  } catch (error) {
    console.error("Error adding to Google Sheet:", error);
    return { success: false, error: error.message };
  }
}
