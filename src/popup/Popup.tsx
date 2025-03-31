import { useState, useEffect } from 'react'

import './Popup.css'

export const Popup = () => {
  const [records, setRecords] = useState<any[]>([])
  const [viewingNote, setViewingNote] = useState<string | null>(null)

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_RECORDS' }, (response) => {
      if (response.records) {
        setRecords(response.records)
      } else {
        console.error(response.error || 'No records found')
      }
    })
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('XPath copied to clipboard');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const groupByDomain = (records: any[]) => {
    return records.reduce((acc: Record<string, any[]>, record: any) => {
      const url = new URL(record.page_url);
      const domain = url.hostname;
      if (!acc[domain]) {
        acc[domain] = [];
      }
      acc[domain].push(record);
      return acc;
    }, {});
  };

  const groupedRecords = groupByDomain(records.slice(0, 5));

  return (
    <main>
      <h3>Design QA</h3>
      {viewingNote ? (
        <div>
          <p>{viewingNote}</p>
          <button onClick={() => setViewingNote(null)}>Back</button>
        </div>
      ) : (
        Object.keys(groupedRecords).length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Index</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Domain</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Page</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedRecords).reverse().map(([domain, domainRecords]) => (
                domainRecords.map((record: any, index: number) => (
                  <tr key={`${domain}-${index}`}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{domain}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {window.location.href === record.page_url ? (
                        <span>Current Page</span>
                      ) : (
                        <a href={record.page_url} target="_blank" rel="noopener noreferrer">
                          Go to Page
                        </a>
                      )}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <button 
                        onClick={() => copyToClipboard(record.xpath)} 
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          border: '1px solid #61dafb',
                          borderRadius: '0.25rem',
                          backgroundColor: '#f0f0f0',
                          color: '#333'
                        }}
                      >
                        Copy XPath
                      </button>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <button 
                        onClick={() => setViewingNote(record.note || 'No note provided')} 
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          border: '1px solid #61dafb',
                          borderRadius: '0.25rem',
                          backgroundColor: '#f0f0f0',
                          color: '#333'
                        }}
                      >
                        View Note
                      </button>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        ) : (
          <p>No flagged buttons</p>
        )
      )}
    </main>
  )
}

export default Popup
