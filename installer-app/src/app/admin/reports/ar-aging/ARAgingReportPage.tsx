import React, { useState } from "react";
import ARAgingFilterPanel, { ARAgingFilters } from "./ARAgingFilterPanel";
import ARAgingSummaryPanel from "./ARAgingSummaryPanel";
import ARAgingReportTable from "./ARAgingReportTable";
import ExportButtonGroup from "./ExportButtonGroup";
import useARAgingReport from "./useARAgingReport";
import { GlobalLoading } from "../../../../components/global-states";

const defaultFilters: ARAgingFilters = {
  date: {
    start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  },
};

const ARAgingReportPage: React.FC = () => {
  const [filters, setFilters] = useState<ARAgingFilters>(defaultFilters);
  const { rows, loading } = useARAgingReport(filters);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">AR Aging Report</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <ARAgingFilterPanel filters={filters} onApply={setFilters} />
        <div className="flex-1 space-y-4">
          <ARAgingSummaryPanel data={rows} />
          <ExportButtonGroup data={rows} />
          {loading ? (
            <GlobalLoading />
          ) : (
            <div id="ar-aging-report-table">
              <ARAgingReportTable data={rows} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARAgingReportPage;
