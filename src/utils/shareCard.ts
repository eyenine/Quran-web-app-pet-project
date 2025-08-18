// Share Card Utility for Quran App
import html2canvas from 'html2canvas';

export interface ShareCardOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  arabicFontSize?: number;
  translationFontSize?: number;
  borderRadius?: number;
  padding?: number;
  showWatermark?: boolean;
  watermarkText?: string;
}

export interface AyahData {
  surahId: number;
  ayahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahText: string;
  translation?: string;
  language?: string;
}

const DEFAULT_OPTIONS: ShareCardOptions = {
  width: 1200,
  height: 800,
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  arabicFontSize: 48,
  translationFontSize: 24,
  borderRadius: 16,
  padding: 40,
  showWatermark: true,
  watermarkText: 'Quran Web App',
};

export class ShareCardGenerator {
  private options: ShareCardOptions;

  constructor(options: Partial<ShareCardOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate a share card image from ayah data
   */
  async generateAyahCard(ayahData: AyahData): Promise<string> {
    try {
      // Create temporary DOM element for rendering
      const cardElement = this.createCardElement(ayahData);
      document.body.appendChild(cardElement);

      // Generate canvas from the element
      const canvas = await html2canvas(cardElement, {
        width: this.options.width!,
        height: this.options.height!,
        backgroundColor: this.options.backgroundColor!,
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Clean up temporary element
      document.body.removeChild(cardElement);

      // Convert to data URL
      return canvas.toDataURL('image/png', 0.9);
    } catch (error) {
      console.error('Error generating share card:', error);
      throw new Error('Failed to generate share card');
    }
  }

  /**
   * Create the DOM element for the share card
   */
  private createCardElement(ayahData: AyahData): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: ${this.options.width}px;
      height: ${this.options.height}px;
      background: ${this.options.backgroundColor};
      border-radius: ${this.options.borderRadius}px;
      padding: ${this.options.padding}px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
      overflow: hidden;
    `;

    // Add gradient background
    const gradient = document.createElement('div');
    gradient.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0.1;
      z-index: 1;
    `;
    card.appendChild(gradient);

    // Content container
    const content = document.createElement('div');
    content.style.cssText = `
      position: relative;
      z-index: 2;
      text-align: center;
      max-width: 100%;
    `;

    // Surah info
    const surahInfo = document.createElement('div');
    surahInfo.style.cssText = `
      margin-bottom: 20px;
      color: ${this.options.textColor};
    `;
    
    const surahName = document.createElement('div');
    surahName.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
      opacity: 0.8;
    `;
    surahName.textContent = `${ayahData.surahName} (${ayahData.surahNameArabic})`;
    
    const ayahNumber = document.createElement('div');
    ayahNumber.style.cssText = `
      font-size: 14px;
      opacity: 0.6;
    `;
    ayahNumber.textContent = `Ayah ${ayahData.ayahNumber}`;
    
    surahInfo.appendChild(surahName);
    surahInfo.appendChild(ayahNumber);

    // Arabic text
    const arabicText = document.createElement('div');
    arabicText.style.cssText = `
      font-size: ${this.options.arabicFontSize}px;
      font-weight: 700;
      color: ${this.options.textColor};
      margin-bottom: 30px;
      line-height: 1.4;
      text-align: right;
      direction: rtl;
      max-width: 100%;
      word-wrap: break-word;
      font-family: 'KFGQPC Uthman Taha Naskh', 'Amiri', serif;
    `;
    arabicText.textContent = ayahData.ayahText;

    // Translation
    let translationElement: HTMLElement | null = null;
    if (ayahData.translation) {
      translationElement = document.createElement('div');
      translationElement.style.cssText = `
        font-size: ${this.options.translationFontSize}px;
        color: ${this.options.textColor};
        line-height: 1.5;
        max-width: 100%;
        word-wrap: break-word;
        opacity: 0.9;
        margin-bottom: 20px;
      `;
      translationElement.textContent = ayahData.translation;
    }

    // Watermark
    let watermarkElement: HTMLElement | null = null;
    if (this.options.showWatermark) {
      watermarkElement = document.createElement('div');
      watermarkElement.style.cssText = `
        position: absolute;
        bottom: ${this.options.padding}px;
        right: ${this.options.padding}px;
        font-size: 12px;
        color: ${this.options.textColor};
        opacity: 0.4;
        font-weight: 500;
      `;
      watermarkElement.textContent = this.options.watermarkText!;
    }

    // Assemble the card
    content.appendChild(surahInfo);
    content.appendChild(arabicText);
    if (translationElement) {
      content.appendChild(translationElement);
    }
    if (watermarkElement) {
      card.appendChild(watermarkElement);
    }
    
    card.appendChild(content);
    return card;
  }

  /**
   * Download the share card as an image file
   */
  async downloadAyahCard(ayahData: AyahData, filename?: string): Promise<void> {
    try {
      const dataUrl = await this.generateAyahCard(ayahData);
      const link = document.createElement('a');
      link.download = filename || `quran-${ayahData.surahId}-${ayahData.ayahNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading share card:', error);
      throw new Error('Failed to download share card');
    }
  }

  /**
   * Copy the share card to clipboard (if supported)
   */
  async copyToClipboard(ayahData: AyahData): Promise<boolean> {
    try {
      const dataUrl = await this.generateAyahCard(ayahData);
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Try to copy to clipboard
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        return true;
      } else {
        // Fallback: create a temporary link and copy
        const link = document.createElement('a');
        link.href = dataUrl;
        link.style.position = 'fixed';
        link.style.top = '-9999px';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return false;
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  /**
   * Share the card via Web Share API (if supported)
   */
  async shareCard(ayahData: AyahData): Promise<boolean> {
    try {
      if (!navigator.share) {
        return false;
      }

      const dataUrl = await this.generateAyahCard(ayahData);
      
      // Convert data URL to blob for sharing
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const file = new File([blob], `quran-${ayahData.surahId}-${ayahData.ayahNumber}.png`, {
        type: 'image/png',
      });

      await navigator.share({
        title: `${ayahData.surahName} - Ayah ${ayahData.ayahNumber}`,
        text: ayahData.translation || ayahData.ayahText,
        files: [file],
      });

      return true;
    } catch (error) {
      console.error('Error sharing card:', error);
      return false;
    }
  }

  /**
   * Update options
   */
  updateOptions(newOptions: Partial<ShareCardOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Get current options
   */
  getOptions(): ShareCardOptions {
    return { ...this.options };
  }
}

// Export default instance
export const shareCardGenerator = new ShareCardGenerator();

// Export convenience functions
export const generateAyahCard = (ayahData: AyahData, options?: Partial<ShareCardOptions>) => {
  const generator = new ShareCardGenerator(options);
  return generator.generateAyahCard(ayahData);
};

export const downloadAyahCard = (ayahData: AyahData, options?: Partial<ShareCardOptions>, filename?: string) => {
  const generator = new ShareCardGenerator(options);
  return generator.downloadAyahCard(ayahData, filename);
};

export const copyAyahCardToClipboard = (ayahData: AyahData, options?: Partial<ShareCardOptions>) => {
  const generator = new ShareCardGenerator(options);
  return generator.copyToClipboard(ayahData);
};

export const shareAyahCard = (ayahData: AyahData, options?: Partial<ShareCardOptions>) => {
  const generator = new ShareCardGenerator(options);
  return generator.shareCard(ayahData);
};

