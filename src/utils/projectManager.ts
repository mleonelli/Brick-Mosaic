import { LegoMosaicProject, MosaicSettings } from '../types';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';

/**
 * Converts an HTMLImageElement to a base64 Data URL so it can be embedded in a project file.
 */
export async function imageToDataUrl(img: HTMLImageElement): Promise<string> {
  // If already a base64 Data URL, return directly
  if (img.src && img.src.startsWith('data:')) {
    return img.src;
  }

  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const width = img.naturalWidth || img.width || 800;
      const height = img.naturalHeight || img.height || 800;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(img.src);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (err) {
      console.warn('Could not export canvas to data URL (possible CORS issue), using image src instead', err);
      resolve(img.src);
    }
  });
}

/**
 * Serializes and triggers download of a .brickmosaic project file.
 */
export async function exportProject(
  projectName: string,
  settings: MosaicSettings,
  imageElement: HTMLImageElement | null,
  embedImage: boolean = true
): Promise<void> {
  let imageDataUrl: string | undefined;

  if (embedImage && imageElement) {
    imageDataUrl = await imageToDataUrl(imageElement);
  }

  const project: LegoMosaicProject = {
    format: 'lego-mosaic-studio',
    version: 1,
    name: projectName || 'Untitled Mosaic',
    createdAt: new Date().toISOString(),
    settings: { ...settings },
    image: {
      name: projectName || 'Mosaic Image',
      dataUrl: imageDataUrl,
      width: imageElement?.naturalWidth || imageElement?.width,
      height: imageElement?.naturalHeight || imageElement?.height,
    },
    metadata: {
      totalDots: settings.width * settings.height,
      dimensions: {
        width: settings.width,
        height: settings.height,
      },
    },
  };

  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const sanitizedName = (projectName || 'brick_mosaic')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const fileName = `${sanitizedName}_${settings.width}x${settings.height}.brickmosaic`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Parses and restores a project from a .brickmosaic, .legomosaic, or .json file.
 */
export async function importProject(
  file: File
): Promise<{ settings: MosaicSettings; imageElement: HTMLImageElement | null; imageName: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        // Validation
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid project file: Not a JSON object.');
        }

        // Support both format: 'lego-mosaic-studio' and generic export structures
        const rawSettings = data.settings || {};
        const projectName = data.name || data.projectName || file.name.replace(/\.[^/.]+$/, '');

        // Merge with DEFAULT_SETTINGS to ensure any newly introduced fields have valid defaults
        const mergedSettings: MosaicSettings = {
          ...DEFAULT_SETTINGS,
          ...rawSettings,
        };

        const imageDataUrl = data.image?.dataUrl || data.imageDataUrl || data.imageSrc;

        if (imageDataUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            resolve({
              settings: mergedSettings,
              imageElement: img,
              imageName: projectName,
            });
          };
          img.onerror = () => {
            console.warn('Could not load embedded project image.');
            resolve({
              settings: mergedSettings,
              imageElement: null,
              imageName: projectName,
            });
          };
          img.src = imageDataUrl;
        } else {
          resolve({
            settings: mergedSettings,
            imageElement: null,
            imageName: projectName,
          });
        }
      } catch (err: any) {
        reject(new Error(err?.message || 'Failed to parse project file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsText(file);
  });
}
