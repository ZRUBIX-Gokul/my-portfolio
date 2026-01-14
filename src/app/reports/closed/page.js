"use client";

import TicketMasterDetail from "@/components/TicketMasterDetail";

export default function ClosedReport() {
  return <TicketMasterDetail title="Closed Tickets Report" filterStatus="Closed" />;
}
