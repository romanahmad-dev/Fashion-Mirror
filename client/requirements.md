## Packages
framer-motion | Complex animations for the luxury feel and wizard transitions
react-dropzone | Drag and drop file upload interactions
clsx | Utility for conditional class names
tailwind-merge | Utility for merging tailwind classes safely

## Notes
- Images will be converted to Base64 Data URIs on the client side before sending, as the schema expects string inputs for images and no dedicated upload endpoint was provided in the manifest.
- Authentication is handled via Replit Auth (/api/login).
- Polling implementation needed for Try-On status checks.
