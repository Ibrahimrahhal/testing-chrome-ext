# designqa

> A Chrome extension tool built with Vite + React, and Manifest v3, designed to flag and store broken buttons on websites.

## Overview

DesignQA is a Chrome extension that provides a convenient way to identify and manage broken buttons on web pages. The main features include:

1. **Highlight All Buttons**: Use `Ctrl+H` to toggle the highlight view, which visually marks all buttons on the current webpage.
2. **Flag Buttons**: Right-click on any button and select "Flag Button" from the context menu. You will be prompted to enter a note describing the issue.

Initially, an alternative option was considered to have a small flag icon appear when hovering over a button. However, this was deemed not user-friendly, as it would require users to either disable the extension when not in use or memorize another shortcut to toggle it.

The extension's popup interface stores the latest 5 records submitted by the user, allowing for easy access and review.

## Installing, Building & Testing

1. Ensure your `Node.js` version is >= **18**.
2. Run `npm install` to install the dependencies.
3. Run `npm run build` to install the dependencies.
4. The chrome extension results will be found at ./build directory, you can load it into chrome following this guide [how-to-install-the-unpacked-extension-in-chrome](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/)

