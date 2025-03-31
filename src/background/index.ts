console.log('background is running')

function generateUserID() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Mimic user ID for testing
let userID = '';
chrome.storage.local.get('userID', (result) => {
  if (!result.userID) {
    userID = generateUserID();
    chrome.storage.local.set({ userID: userID }, () => {
      console.log('New userID created and saved:', userID);
    });
  } else {
    userID = result.userID;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  } else if (request.type === 'FLAG_BUTTON') {
    console.log('background has received a message from popup, and xpath is ', request?.xpath)
    sendToSupabase(request.pageUrl, request.xpath, request.note);
  } else if (request.type === 'GET_RECORDS') {
    retrieveUserRecords(userID).then(records => {
      sendResponse({ records });
    }).catch(error => {
      console.error('Error retrieving records:', error);
      sendResponse({ error: 'Failed to retrieve records' });
    });
    return true;
  }
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
      id: "flagButton",
      title: "Flag this button",
      contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "flagButton" && tab) {
      chrome.tabs.sendMessage(tab.id!, { type: 'FLAG_BUTTON' });
  }
});

function sendToSupabase(pageUrl: string, xpath: string, note: string) {
  fetch('https://iclptqefoxvzgqmpcsxe.supabase.co/rest/v1/flagged_buttons', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbHB0cWVmb3h2emdxbXBjc3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDAyMjksImV4cCI6MjA1OTAxNjIyOX0.hX0ldfGrETFl2Fa9sOnDE7ub3DAW9nQOUSJrtVqLjW8',
      },
      body: JSON.stringify({
          page_url: pageUrl,
          xpath: xpath,
          user_id: userID,
          note: note
      })
  })
  .then(response => {
    if (response.ok) {
      console.log('Data sent to Supabase:', response);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'SUPABASE_SUCCESS', message: 'Data successfully sent to data base' });
        }
      });
    } else {
      throw new Error('Failed to send data to Supabase');
    }
  })
  .catch(error => {
    console.error('Error sending data to Supabase:', error);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SUPABASE_FAILURE', message: 'Error sending data to data base' });
      }
    });
  });
}

function retrieveUserRecords(userId: string) {
  return fetch(`https://iclptqefoxvzgqmpcsxe.supabase.co/rest/v1/flagged_buttons?user_id=eq.${userId}`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbHB0cWVmb3h2emdxbXBjc3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDAyMjksImV4cCI6MjA1OTAxNjIyOX0.hX0ldfGrETFl2Fa9sOnDE7ub3DAW9nQOUSJrtVqLjW8',
      }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Records retrieved from Supabase:', data);
    return data;
  })
  .catch(error => {
    console.error('Error retrieving records from Supabase:', error);
    throw error;
  });
}
