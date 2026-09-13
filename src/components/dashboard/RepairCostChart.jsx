const RepairCostChart = ({ dashboard }) => {
  const cost = dashboard?.totalRepairCost ?? 0;

  return (
    <div className="d-flex flex-column justify-content-center h-100">
      <div className="text-muted small text-uppercase fw-semibold mb-2">
        Total Repair Cost
      </div>

      <div
        className="fw-bold text-success mb-3"
        style={{ fontSize: "2rem" }}
      >
        {Number(cost).toFixed(2)}
      </div>

      <div className="progress" style={{ height: "10px" }}>
        <div
          className="progress-bar bg-success"
          role="progressbar"
          style={{
            width: `${
              Math.min(100, (cost / (cost + 1000 || 1)) * 100 * 3) || 5
            }%`,
          }}
        ></div>
      </div>

      <div className="text-muted small mt-2">
        Aggregate cost of all maintenance records.
      </div>
    </div>
  );
};

export default RepairCostChart;