console.info('contentScript is running');

let lastElement: HTMLElement | null = null;
let buttonsHighlighted = false;

document.addEventListener('contextmenu', function(e) {
  lastElement = e.target as HTMLElement;
});

function toggleButtonHighlight() {
  const styleId = 'button-highlight-style';
  let styleElement = document.getElementById(styleId);

  if (buttonsHighlighted) {
    if (styleElement) {
      styleElement.remove();
    }
  } else {
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.innerHTML = `
        button {
          outline: 2px solid red !important;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }
  buttonsHighlighted = !buttonsHighlighted;
}

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'h') {
    toggleButtonHighlight();
    e.preventDefault();
  }
});

function getXPath(element: HTMLElement): string | undefined {
    if (element.id !== '') {
        return 'id("' + element.id + '")';
    }
    if (element === document.body) {
        return element.tagName;
    }

    let ix = 0;
    const siblings = element.parentNode?.childNodes;
    if (!siblings) return undefined;
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === element) {
            return getXPath(element.parentNode as HTMLElement) + '/' + element.tagName + '[' + (ix + 1) + ']';
        }
        if (sibling.nodeType === 1 && (sibling as HTMLElement).tagName === element.tagName) {
            ix++;
        }
    }
}

function findParentOfType(element: HTMLElement | null, tagName: string): HTMLElement | null {
    if (!element) return null;
    if (element.tagName === tagName) return element;
    return findParentOfType(element.parentElement, tagName);
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'FLAG_BUTTON' && lastElement) {
    const button = findParentOfType(lastElement, 'BUTTON');
    if (button) {
      const xpath = getXPath(button as HTMLElement);
      const note = prompt('Please provide a note for this button');
      chrome.runtime.sendMessage({
        type: 'FLAG_BUTTON',
        pageUrl: window.location.href,
        xpath: xpath ?? '',
        note: note ?? ''
      });
    }
  } else if (request.type === 'SUPABASE_SUCCESS') {
    alert('Data successfully sent to database');
  } else if (request.type === 'SUPABASE_FAILURE') {
    alert('Error sending data to database');
  }
});
