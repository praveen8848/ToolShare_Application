export const readImageFiles = (files) => Promise.all(
  files.map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Failed to read image file'));
    reader.onabort = () => reject(new Error('Image file reading was cancelled'));
    reader.readAsDataURL(file);
  }))
);
