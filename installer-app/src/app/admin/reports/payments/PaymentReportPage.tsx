import React, { useState } from "react";
import RequireRole from "../../../../components/RequireRole";
import PaymentFilterPanel, { PaymentFilters } from "./PaymentFilterPanel";
import PaymentSummaryPanel from "./PaymentSummaryPanel";
import PaymentReportTable from "./PaymentReportTable";
import ExportButtonGroup from "./ExportButtonGroup";
import usePaymentReport from "./usePaymentReport";

const defaultFilters: PaymentFilters = {
  date: {
    start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  },
};

const PaymentReportPage: React.FC = () => {
  const [filters, setFilters] = useState<PaymentFilters>(defaultFilters);
  const { rows, loading } = usePaymentReport(filters);

  return (
    <RequireRole role={["Admin", "Finance"]}>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Payment Report</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <PaymentFilterPanel filters={filters} onApply={setFilters} />
          <div className="flex-1 space-y-4">
            <PaymentSummaryPanel data={rows} />
            <ExportButtonGroup data={rows} />
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div id="payment-report-table">
                <PaymentReportTable data={rows} />
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireRole>
  );
};

export default PaymentReportPage;
