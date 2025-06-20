<ul className="space-y-4">
  {jobs.map((job) => (
    <li key={job.id} className="p-2 rounded bg-gray-50">
      <JobCard job={job} onViewDetails={() => handleView(job.id)} />
      <div className="mt-2 flex gap-2">
        <SZButton size="sm" onClick={() => handleView(job.id)}>
          View
        </SZButton>
        <SZButton
          size="sm"
          variant="secondary"
          onClick={() => handleEdit(job.id)}
        >
          Edit
        </SZButton>
        <SZButton
          size="sm"
          variant="secondary"
          onClick={() => handleUpload(job.id)}
        >
          Upload Docs
        </SZButton>
        <SZButton
          size="sm"
          variant="secondary"
          onClick={() => handleAssignInventory(job.id)}
        >
          Assign Inventory
        </SZButton>
      </div>
    </li>
  ))}
</ul>
