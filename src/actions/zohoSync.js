"use server";

/**
 * Zoho Sync Version 3.3 (UPDATE FIX based on Deluge sample)
 * Using PUT method and CONFIG including criteria as per user sample
 */
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ORG_ID = process.env.ZOHO_ORG_ID;
const REGION = process.env.ZOHO_REGION || "zoho.in";
const WORKSPACE_ID = process.env.ZOHO_WORKSPACE; 
const TABLE_ID = process.env.ZOHO_TABLE;

async function getAccessToken() {
  const url = `https://accounts.${REGION}/oauth/v2/token?refresh_token=${ZOHO_REFRESH_TOKEN}&client_id=${ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=refresh_token`;

  try {
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Zoho Access Token:", error);
    return null;
  }
}

export async function syncTicketToZoho(ticket, action = "INSERT") {
  console.log(`--- Zoho Sync Version 3.3: ${action} for Ticket ${ticket.id} ---`);
  
  const accessToken = await getAccessToken();
  if (!accessToken) return { success: false, error: "Auth failed" };

  const baseUrl = `https://analyticsapi.${REGION}/restapi/v2/workspaces/${WORKSPACE_ID}/views/${TABLE_ID}/rows`;

  const columnsData = {
    "ID": String(ticket.id),
    "Ticket_No": Number(ticket.ticketNo),
    "Ticket_Date": ticket.ticketDate,
    "Requested_By": ticket.requestedBy,
    "Department": ticket.department,
    "To_Dept": ticket.toDept,
    "Description": ticket.description,
    "Priority": ticket.priority,
    "Status": ticket.status,
    "Assigned_To": ticket.assignedTo || "",
    "Assigned_Date": ticket.assignedDate || "",
    "Completed_By": ticket.completedBy || "",
    "Completed_On": ticket.completedOn || ""
  };

  try {
    let url = baseUrl;
    let method = "POST";
    let config = { columns: columnsData };

    if (action === "INSERT") {
      method = "POST";
    } else if (action === "UPDATE") {
      // Based on Deluge sample: Use PUT and put criteria INSIDE CONFIG
      method = "PUT";
      config.criteria = `"ID"='${ticket.id}'`;
    } else if (action === "DELETE") {
      method = "DELETE";
      url = `${baseUrl}?criteria="ID"='${ticket.id}'`;
    }

    // Parameters passed as Query String in PUT/PATCH usually or CONFIG param
    const params = new URLSearchParams();
    params.append("CONFIG", JSON.stringify(config));
    
    // In Deluge sample, parameters are appended to URL
    if (method === "PUT" || method === "PATCH" || method === "DELETE") {
        url = `${url}?${params.toString()}`;
    }

    const fetchOptions = {
      method: method,
      headers: {
        "Authorization": `Zoho-oauthtoken ${accessToken}`,
        "ZANALYTICS-ORGID": ORG_ID
      }
    };

    // For POST (Insert), we send as body
    if (method === "POST") {
        fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
        fetchOptions.body = params.toString();
    }

    console.log(`Calling Zoho [${method}]: ${url}`);

    const response = await fetch(url, fetchOptions);
    const status = response.status;
    const responseText = await response.text();
    
    if (response.ok) {
        console.log(`Zoho Sync Success [${action}]`);
        return { success: true };
    } else {
        console.error(`Status ${status} Error:`, responseText);
        return { success: false, error: responseText };
    }
  } catch (error) {
    console.error(`Zoho Sync Exception:`, error);
    return { success: false, error: error.message };
  }
}
