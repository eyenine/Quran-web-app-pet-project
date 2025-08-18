// SEO Meta Component
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'book';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export const Meta: React.FC<MetaProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author = 'Quran Web App',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}) => {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;
  const defaultTitle = 'Quran Web App - Read, Listen, and Learn the Holy Quran';
  const defaultDescription = 'A comprehensive Quran web application with Arabic text, translations, audio recitations, Tafsir, and more. Available in multiple languages.';
  const defaultImage = `${window.location.origin}/logo512.png`;

  useEffect(() => {
    // Update document title
    document.title = title ? `${title} | Quran Web App` : defaultTitle;

    // Update meta description
    updateMetaTag('description', description || defaultDescription);
    
    // Update meta keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Update Open Graph tags
    updateMetaTag('og:title', title || defaultTitle);
    updateMetaTag('og:description', description || defaultDescription);
    updateMetaTag('og:image', image || defaultImage);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'Quran Web App');

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title || defaultTitle);
    updateMetaTag('twitter:description', description || defaultDescription);
    updateMetaTag('twitter:image', image || defaultImage);

    // Update article-specific meta tags
    if (type === 'article') {
      if (author) updateMetaTag('article:author', author);
      if (publishedTime) updateMetaTag('article:published_time', publishedTime);
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime);
      if (section) updateMetaTag('article:section', section);
      tags.forEach(tag => {
        updateMetaTag('article:tag', tag, true);
      });
    }

    // Update canonical URL
    updateCanonicalUrl(currentUrl);

    // Update JSON-LD structured data
    updateStructuredData({
      title: title || defaultTitle,
      description: description || defaultDescription,
      url: currentUrl,
      type,
      author,
      publishedTime,
      modifiedTime,
      image: image || defaultImage,
    });

  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, section, tags, currentUrl]);

  const updateMetaTag = (name: string, content: string, append = false) => {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }

    if (append && meta.content) {
      meta.content += `, ${content}`;
    } else {
      meta.content = content;
    }
  };

  const updateCanonicalUrl = (url: string) => {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    
    canonical.href = url;
  };

  const updateStructuredData = (data: any) => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': data.type === 'article' ? 'Article' : 'WebApplication',
      name: data.title,
      description: data.description,
      url: data.url,
      author: {
        '@type': 'Person',
        name: data.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Quran Web App',
        url: window.location.origin,
      },
      image: data.image,
      ...(data.type === 'article' && {
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime,
      }),
      ...(data.type === 'website' && {
        applicationCategory: 'Religious Application',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      }),
    };

    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      // Reset to default values when component unmounts
      document.title = defaultTitle;
      updateMetaTag('description', defaultDescription);
      updateMetaTag('og:title', defaultTitle);
      updateMetaTag('og:description', defaultDescription);
      updateMetaTag('og:image', defaultImage);
      updateMetaTag('og:type', 'website');
      updateMetaTag('twitter:title', defaultTitle);
      updateMetaTag('twitter:description', defaultDescription);
      updateMetaTag('twitter:image', defaultImage);
    };
  }, []);

  return null; // This component doesn't render anything
};

// Hook for easy meta updates
export const useMeta = (meta: MetaProps) => {
  return <Meta {...meta} />;
};

// Predefined meta configurations for common pages
export const META_CONFIGS = {
  home: {
    title: 'Quran Web App - Read, Listen, and Learn the Holy Quran',
    description: 'A comprehensive Quran web application with Arabic text, translations, audio recitations, Tafsir, and more. Available in multiple languages.',
    keywords: 'Quran, Holy Quran, Islamic, Arabic, Translation, Audio, Tafsir, Muslim, Islam',
    type: 'website' as const,
  },
  surah: (surahName: string, surahNumber: number) => ({
    title: `Surah ${surahName} (${surahNumber}) - Quran Web App`,
    description: `Read and listen to Surah ${surahName} (${surahNumber}) with Arabic text, translations, and audio recitations.`,
    keywords: `Surah ${surahName}, Quran ${surahNumber}, ${surahName} surah, Islamic, Arabic`,
    type: 'article' as const,
    section: 'Quran Surahs',
  }),
  search: (query: string) => ({
    title: `Search Results for "${query}" - Quran Web App`,
    description: `Search results for "${query}" in the Holy Quran. Find verses, translations, and Tafsir.`,
    keywords: `Quran search, ${query}, Islamic search, Quran verses`,
    type: 'website' as const,
  }),
  tafsir: (surahName: string, ayahNumber: number) => ({
    title: `Tafsir of Surah ${surahName} Ayah ${ayahNumber} - Quran Web App`,
    description: `Detailed Tafsir (interpretation) of Surah ${surahName} Ayah ${ayahNumber}. Learn the meaning and context.`,
    keywords: `Tafsir, ${surahName}, Ayah ${ayahNumber}, Quran interpretation, Islamic learning`,
    type: 'article' as const,
    section: 'Quran Tafsir',
  }),
  bookmarks: {
    title: 'My Bookmarks - Quran Web App',
    description: 'Access your bookmarked Quran verses, Tafsir, and notes. Personalize your Quran reading experience.',
    keywords: 'Quran bookmarks, saved verses, personal Quran, Islamic learning',
    type: 'website' as const,
  },
  settings: {
    title: 'Settings - Quran Web App',
    description: 'Customize your Quran reading experience with language preferences, theme settings, and audio controls.',
    keywords: 'Quran settings, preferences, customization, Islamic app',
    type: 'website' as const,
  },
};

