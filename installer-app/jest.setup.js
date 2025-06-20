if (typeof global.fetch === 'undefined') {
  const sampleJobs = [
    {
      jobId: 'SEA1041',
      jobNumber: 'SEA#1041',
      customerName: 'Lincoln Elementary',
      address: '1234 Solar Lane',
      assignedTo: 'user_345',
      status: 'assigned',
      zones: [],
    },
    {
      jobId: 'SEA1042',
      jobNumber: 'SEA#1042',
      customerName: 'Jefferson High',
      address: '9876 Copper Rd',
      assignedTo: 'user_345',
      status: 'in_progress',
      zones: [],
    },
  ];

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(sampleJobs),
    })
  );
}