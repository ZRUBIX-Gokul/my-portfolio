"use server";

import { google } from "googleapis";

// Function to append a new ticket row to Google Sheets
export async function addTicketToSheet(ticketData) {
  try {
    // 1. Check Credentials
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    // Aggressive cleaning for the private key to fix "DECODER routines::unsupported"
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey) {
      // Remove surrounding quotes if they exist, then handle newline characters
      privateKey = privateKey.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n');
    }
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
      console.log("❌ GOOGLE SHEETS ERROR: Credentials Missing");
      return { success: false, error: "Credentials missing" };
    }

    console.log("🔑 Key Loaded:", privateKey ? privateKey.substring(0, 30) + "..." : "EMPTY");
    console.log("📡 Attempting to add ticket to Google Sheet:", ticketData.ticketNo);

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

    // 3. Prepare Data Row (A to M)
    const rowValues = [
      ticketData.ticketNo,
      ticketData.ticketDate,
      ticketData.requestedBy,
      ticketData.department,
      ticketData.toDept,
      ticketData.priority,
      ticketData.description,
      ticketData.status,
      ticketData.assignedTo || "-",
      ticketData.assignedDate || "-",
      ticketData.completedOn || "-",
      ticketData.remarks || "-",
      new Date().toLocaleString() // Timestamp of entry
    ];

    // 4. Append to Sheet
    await googleSheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:M", // Expanded range
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

// Function to update an existing ticket row in Google Sheets
export async function updateTicketInSheet(ticketNo, ticketData) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n');
    }
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
      console.log("❌ GOOGLE SHEETS UPDATE ERROR: Credentials Missing");
      return { success: false, error: "Credentials missing" };
    }

    console.log("📡 Attempting to UPDATE ticket in Google Sheet:", ticketNo);

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const googleSheets = google.sheets({ version: "v4", auth });

    // 1. Get all rows to find the match
    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!A:M",
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === String(ticketNo));

    if (rowIndex === -1) return { success: false, error: "Ticket not found in sheet" };

    // 2. Prepare new values for the row (A to M)
    const updatedValues = [
        ticketData.ticketNo,
        ticketData.ticketDate,
        ticketData.requestedBy,
        ticketData.department,
        ticketData.toDept,
        ticketData.priority,
        ticketData.description,
        ticketData.status,
        ticketData.assignedTo || "-",
        ticketData.assignedDate || "-",
        ticketData.completedOn || "-",
        ticketData.remarks || "-",
        new Date().toLocaleString() + " (Updated)"
    ];

    // 3. Update the specific row
    await googleSheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Sheet1!A${rowIndex + 1}:M${rowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [updatedValues],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating Google Sheet:", error);
    return { success: false, error: error.message };
  }
}
