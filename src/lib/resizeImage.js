// Downscales an uploaded image to a sane size before storing it as a data
// URL, so a non-technical user can't accidentally upload a 10MB photo and
// bloat every generated PDF — or, worse, produce a submission payload big
// enough for Netlify Functions to reject outright (there's a ~6MB request
// body limit). Defaults to PNG (lossless, keeps transparency — used for
// logos); pass { format: 'jpeg' } for photos, where JPEG compression keeps
// the data URL dramatically smaller.
export function resizeImageFile(file, maxDim = 320, { format = 'png', quality = 0.9 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That does not look like a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (format === 'jpeg') {
          // JPEG has no alpha channel — flatten onto white first, or a
          // transparent PNG source would otherwise turn black.
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);
        const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
