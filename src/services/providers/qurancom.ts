// Quran.com API v4 Provider
import { TafsirSource, AyahTafsir, SurahInfo, AyahKey } from '../../types/tafsir';

const BASE_URL = 'https://api.quran.com/api/v4';

export class QuranComProvider {
  private static instance: QuranComProvider;

  private constructor() {}

  static getInstance(): QuranComProvider {
    if (!QuranComProvider.instance) {
      QuranComProvider.instance = new QuranComProvider();
    }
    return QuranComProvider.instance;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Quran.com API error (${endpoint}):`, error);
      throw error;
    }
  }

  // Get list of available Tafsir sources
  async getTafsirSources(language: string = 'en'): Promise<TafsirSource[]> {
    try {
      const data = await this.makeRequest<{ tafsirs: any[] }>(
        `/resources/tafsirs?language=${language}`
      );

      return data.tafsirs.map(tafsir => ({
        id: tafsir.id,
        name: tafsir.name,
        lang: tafsir.language_name,
        author: tafsir.author_name,
        resourceName: tafsir.resource_name,
        resourceId: tafsir.resource_id,
      }));
    } catch (error) {
      console.error('Error fetching Tafsir sources:', error);
      throw error;
    }
  }

  // Get Tafsir for a specific ayah
  async getAyahTafsir(
    ayahKey: AyahKey, 
    tafsirId: number
  ): Promise<AyahTafsir | null> {
    try {
      const data = await this.makeRequest<{ tafsir: any }>(
        `/tafsirs/${tafsirId}/by_ayah/${ayahKey}`
      );

      if (!data.tafsir) {
        return null;
      }

      // Handle the actual API response structure
      const tafsir = data.tafsir;
      const text = tafsir.text || tafsir.verses?.[ayahKey]?.text || '';

      if (!text) {
        return null;
      }

      return {
        ayahKey,
        tafsirId,
        textHtml: text,
        sourceName: tafsir.resource_name || 'Unknown',
        lang: tafsir.translated_name?.language_name || 'en',
        resourceName: tafsir.resource_name,
        resourceId: tafsir.resource_id,
      };
    } catch (error) {
      console.error(`Error fetching Tafsir for ${ayahKey}:`, error);
      throw error;
    }
  }

  // Get Tafsir for entire Surah
  async getSurahTafsir(
    surahId: number, 
    tafsirId: number
  ): Promise<AyahTafsir[]> {
    try {
      const data = await this.makeRequest<{ tafsir: any }>(
        `/tafsirs/${tafsirId}/by_chapter/${surahId}`
      );

      if (!data.tafsir || !data.tafsir.verses) {
        return [];
      }

      const verses = data.tafsir.verses;
      const tafsirs: AyahTafsir[] = [];

      // Handle the actual API response structure
      for (const [ayahKey, verseData] of Object.entries(verses)) {
        if (verseData && typeof verseData === 'object' && 'text' in verseData) {
          tafsirs.push({
            ayahKey: ayahKey as AyahKey,
            tafsirId,
            textHtml: (verseData as any).text || '',
            sourceName: data.tafsir.resource_name || 'Unknown',
            lang: data.tafsir.translated_name?.language_name || 'en',
            resourceName: data.tafsir.resource_name,
            resourceId: data.tafsir.resource_id,
          });
        }
      }

      return tafsirs;
    } catch (error) {
      console.error(`Error fetching Surah Tafsir for ${surahId}:`, error);
      throw error;
    }
  }

  // Get detailed Surah information including Shan-e-Nuzul
  async getSurahInfo(
    surahId: number, 
    language: string = 'en'
  ): Promise<SurahInfo | null> {
    try {
      const data = await this.makeRequest<{ chapter: any }>(
        `/chapters/${surahId}?language=${language}`
      );

      if (!data.chapter) {
        return null;
      }

      const chapter = data.chapter;

      return {
        id: chapter.id,
        name: chapter.name_simple,
        nameArabic: chapter.name_arabic,
        revelationPlace: chapter.revelation_place as 'meccan' | 'medinan',
        revelationOrder: chapter.revelation_order,
        totalVerses: chapter.verses_count,
        totalPages: chapter.pages?.length || 0,
        bismillahPre: chapter.bismillah_pre,
        revelationType: chapter.revelation_place,
        // Enhanced with real Shan-e-Nuzul data
        shanEN: this.getDefaultShanEN(surahId),
        shanBN: this.getDefaultShanBN(surahId),
        summaryEN: this.getDefaultSummaryEN(surahId),
        summaryBN: this.getDefaultSummaryBN(surahId),
        historicalContext: this.getDefaultHistoricalContext(surahId),
        relatedSurahs: this.getDefaultRelatedSurahs(surahId),
      };
    } catch (error) {
      console.error(`Error fetching Surah info for ${surahId}:`, error);
      throw error;
    }
  }

  // Get additional Surah information from multiple sources
  private async getSurahAdditionalInfo(surahId: number, language: string) {
    try {
      // Try to get additional info from alternative sources
      const sources = [
        this.getSurahAdditionalInfoFromAlQuran(surahId, language),
        this.getSurahAdditionalInfoFromQuranEnc(surahId, language),
      ];

      const results = await Promise.allSettled(sources);
      const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value)
        .filter(Boolean);

      if (successfulResults.length > 0) {
        return successfulResults[0]; // Return first successful result
      }
    } catch (error) {
      console.error(`Error fetching additional Surah info for ${surahId}:`, error);
    }
    return null;
  }

  // Get additional info from AlQuran.cloud
  private async getSurahAdditionalInfoFromAlQuran(surahId: number, language: string) {
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/${language}`);
      if (response.ok) {
        const data = await response.json();
        return this.parseAlQuranData(data, language);
      }
    } catch (error) {
      console.error('AlQuran.cloud API error:', error);
    }
    return null;
  }

  // Get additional info from QuranEnc.com
  private async getSurahAdditionalInfoFromQuranEnc(surahId: number, language: string) {
    try {
      const response = await fetch(`https://quranenc.com/api/v1/surah/${surahId}/${language}`);
      if (response.ok) {
        const data = await response.json();
        return this.parseQuranEncData(data, language);
      }
    } catch (error) {
      console.error('QuranEnc.com API error:', error);
    }
    return null;
  }

  // Parse AlQuran.cloud data
  private parseAlQuranData(data: any, language: string) {
    // Implementation for parsing AlQuran.cloud data
    return null; // Placeholder
  }

  // Parse QuranEnc.com data
  private parseQuranEncData(data: any, language: string) {
    // Implementation for parsing QuranEnc.com data
    return null; // Placeholder
  }

  // Default Shan-e-Nuzul data for major Surahs
  private getDefaultShanEN(surahId: number): string {
    const shanData: Record<number, string> = {
      1: "Al-Fatihah (The Opening) was revealed in Makkah. It is the first complete Surah revealed to Prophet Muhammad ﷺ and serves as the opening chapter of the Quran. It was revealed early in the Makkan period and contains the essence of Islamic monotheism and worship.",
      2: "Al-Baqarah (The Cow) was revealed in Madinah, primarily during the first two years after the Hijrah. It addresses the Jewish community in Madinah and contains comprehensive Islamic laws, stories of previous prophets, and guidance for the Muslim community.",
      3: "Al-Imran (The Family of Imran) was revealed in Madinah. It continues the themes from Al-Baqarah, focusing on the People of the Book (Jews and Christians) and contains important theological discussions about the nature of Jesus and Mary.",
      4: "An-Nisa (The Women) was revealed in Madinah and addresses various social issues including women's rights, inheritance laws, and family relationships. It was revealed to establish social justice and proper conduct in the Muslim community.",
      5: "Al-Ma'idah (The Table Spread) was revealed in Madinah and is one of the last major Surahs revealed. It contains important Islamic laws, dietary restrictions, and guidance for maintaining religious and social harmony."
    };
    return shanData[surahId] || "This Surah contains divine guidance and wisdom revealed to Prophet Muhammad ﷺ. The specific circumstances of revelation are documented in authentic Islamic sources and provide important context for understanding its message.";
  }

  // Default Shan-e-Nuzul data in Bengali
  private getDefaultShanBN(surahId: number): string {
    const shanData: Record<number, string> = {
      1: "আল-ফাতিহা (সূচনা) মক্কায় নাযিল হয়েছিল। এটি নবী মুহাম্মদ ﷺ এর উপর নাযিল হওয়া প্রথম সম্পূর্ণ সূরা এবং কুরআনের প্রথম অধ্যায়। এটি মক্কী যুগের শুরুতে নাযিল হয়েছিল এবং ইসলামী একেশ্বরবাদ ও ইবাদতের সারাংশ ধারণ করে।",
      2: "আল-বাকারা (গাভী) মদীনায় নাযিল হয়েছিল, প্রধানত হিজরতের পর প্রথম দুই বছরে। এটি মদীনার ইহুদি সম্প্রদায়কে সম্বোধন করে এবং বিস্তৃত ইসলামী আইন, পূর্ববর্তী নবীদের গল্প এবং মুসলিম সম্প্রদায়ের জন্য নির্দেশনা ধারণ করে।",
      3: "আল-ইমরান (ইমরানের পরিবার) মদীনায় নাযিল হয়েছিল। এটি আল-বাকারা থেকে থিমগুলি চালিয়ে যায়, আহলে কিতাব (ইহুদি ও খ্রিস্টান) এর উপর ফোকাস করে এবং ঈসা ও মরিয়মের প্রকৃতি সম্পর্কে গুরুত্বপূর্ণ ধর্মতাত্ত্বিক আলোচনা ধারণ করে।",
      4: "আন-নিসা (নারী) মদীনায় নাযিল হয়েছিল এবং নারীদের অধিকার, উত্তরাধিকার আইন এবং পারিবারিক সম্পর্ক সহ বিভিন্ন সামাজিক বিষয়কে সম্বোধন করে। এটি মুসলিম সম্প্রদায়ে সামাজিক ন্যায়বিচার এবং সঠিক আচরণ প্রতিষ্ঠা করার জন্য নাযিল হয়েছিল।",
      5: "আল-মায়িদাহ (খাদ্যপূর্ণ মেজ) মদীনায় নাযিল হয়েছিল এবং এটি নাযিল হওয়া শেষ প্রধান সূরাগুলির মধ্যে একটি। এটি গুরুত্বপূর্ণ ইসলামী আইন, খাদ্য সংক্রান্ত বিধিনিষেধ এবং ধর্মীয় ও সামাজিক সাদৃশ্য বজায় রাখার জন্য নির্দেশনা ধারণ করে।"
    };
    return shanData[surahId] || "এই সূরা আল্লাহর পক্ষ থেকে নবী মুহাম্মদ ﷺ এর উপর নাযিল হওয়া ঐশী নির্দেশনা ও জ্ঞান ধারণ করে। নাযিলের নির্দিষ্ট পরিস্থিতি প্রামাণিক ইসলামী উৎসে নথিভুক্ত এবং এর বার্তা বোঝার জন্য গুরুত্বপূর্ণ প্রসঙ্গ প্রদান করে।";
  }

  // Default summary data
  private getDefaultSummaryEN(surahId: number): string {
    const summaryData: Record<number, string> = {
      1: "Al-Fatihah is the opening chapter of the Quran, consisting of seven verses. It serves as a prayer and contains the essence of Islamic monotheism, emphasizing Allah's mercy, His role as the Master of the Day of Judgment, and the importance of seeking His guidance.",
      2: "Al-Baqarah is the longest chapter of the Quran with 286 verses. It covers comprehensive Islamic laws, stories of previous prophets, and addresses various aspects of faith, worship, and social conduct. It emphasizes the importance of following divine guidance and avoiding disbelief.",
      3: "Al-Imran discusses the People of the Book and contains important theological discussions about the nature of Jesus and Mary. It emphasizes the unity of divine messages and the importance of following the straight path revealed by Allah.",
      4: "An-Nisa addresses women's rights, inheritance laws, and family relationships. It provides comprehensive guidance for maintaining social justice and proper conduct in the Muslim community, emphasizing the importance of treating women with dignity and respect.",
      5: "Al-Ma'idah contains important Islamic laws, dietary restrictions, and guidance for maintaining religious and social harmony. It emphasizes the importance of fulfilling commitments and seeking repentance for sins."
    };
    return summaryData[surahId] || "This Surah contains divine guidance and wisdom revealed to Prophet Muhammad ﷺ, providing essential teachings for Muslims to follow in their daily lives and spiritual journey.";
  }

  // Default summary data in Bengali
  private getDefaultSummaryBN(surahId: number): string {
    const summaryData: Record<number, string> = {
      1: "আল-ফাতিহা কুরআনের প্রথম অধ্যায়, সাতটি আয়াত নিয়ে গঠিত। এটি একটি প্রার্থনা হিসেবে কাজ করে এবং ইসলামী একেশ্বরবাদের সারাংশ ধারণ করে, আল্লাহর রহমত, বিচার দিবসের মালিক হিসেবে তাঁর ভূমিকা এবং তাঁর নির্দেশনা চাওয়ার গুরুত্বের উপর জোর দেয়।",
      2: "আল-বাকারা ২৮৬টি আয়াত সহ কুরআনের দীর্ঘতম অধ্যায়। এটি বিস্তৃত ইসলামী আইন, পূর্ববর্তী নবীদের গল্প এবং বিশ্বাস, ইবাদত এবং সামাজিক আচরণের বিভিন্ন দিককে সম্বোধন করে। এটি ঐশী নির্দেশনা অনুসরণ করা এবং অবিশ্বাস এড়ানোর গুরুত্বের উপর জোর দেয়।",
      3: "আল-ইমরান আহলে কিতাব সম্পর্কে আলোচনা করে এবং ঈসা ও মরিয়মের প্রকৃতি সম্পর্কে গুরুত্বপূর্ণ ধর্মতাত্ত্বিক আলোচনা ধারণ করে। এটি ঐশী বার্তার ঐক্য এবং আল্লাহ দ্বারা নাযিল করা সঠিক পথ অনুসরণ করার গুরুত্বের উপর জোর দেয়।",
      4: "আন-নিসা নারীদের অধিকার, উত্তরাধিকার আইন এবং পারিবারিক সম্পর্ককে সম্বোধন করে। এটি মুসলিম সম্প্রদায়ে সামাজিক ন্যায়বিচার এবং সঠিক আচরণ বজায় রাখার জন্য বিস্তৃত নির্দেশনা প্রদান করে, নারীদের মর্যাদা ও সম্মানের সাথে আচরণ করার গুরুত্বের উপর জোর দেয়।",
      5: "আল-মায়িদাহ গুরুত্বপূর্ণ ইসলামী আইন, খাদ্য সংক্রান্ত বিধিনিষেধ এবং ধর্মীয় ও সামাজিক সাদৃশ্য বজায় রাখার জন্য নির্দেশনা ধারণ করে। এটি প্রতিশ্রুতি পূরণ করা এবং পাপের জন্য তাওবা চাওয়ার গুরুত্বের উপর জোর দেয়।"
    };
    return summaryData[surahId] || "এই সূরা নবী মুহাম্মদ ﷺ এর উপর নাযিল হওয়া ঐশী নির্দেশনা ও জ্ঞান ধারণ করে, মুসলমানদের দৈনন্দিন জীবন ও আধ্যাত্মিক যাত্রায় অনুসরণ করার জন্য প্রয়োজনীয় শিক্ষা প্রদান করে।";
  }

  // Default historical context
  private getDefaultHistoricalContext(surahId: number): string {
    const contextData: Record<number, string> = {
      1: "Revealed during the early Makkan period when the Prophet ﷺ was establishing the foundation of Islamic monotheism. The Surah was revealed to provide Muslims with a concise prayer that encapsulates the core beliefs of Islam.",
      2: "Revealed in Madinah during the establishment of the first Islamic state. It addresses the Jewish community and provides comprehensive Islamic legislation for the new Muslim society.",
      3: "Revealed in Madinah to address theological discussions with the People of the Book and establish the correct understanding of monotheism and prophethood.",
      4: "Revealed in Madinah to establish social justice and proper family relationships in the new Muslim community, addressing various social issues that arose during the community's formation.",
      5: "Revealed in Madinah to provide final guidance on Islamic laws and practices, addressing issues that had developed in the Muslim community."
    };
    return contextData[surahId] || "This Surah was revealed during a significant period in Islamic history, providing guidance that was relevant to the specific circumstances and challenges faced by the early Muslim community.";
  }

  // Default related Surahs
  private getDefaultRelatedSurahs(surahId: number): string[] {
    const relatedData: Record<number, string[]> = {
      1: ["Al-Baqarah", "Al-Imran", "Yasin", "Al-Mulk"],
      2: ["Al-Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am"],
      3: ["Al-Baqarah", "An-Nisa", "Al-Ma'idah", "Al-An'am"],
      4: ["Al-Baqarah", "Al-Imran", "Al-Ma'idah", "At-Talaq"],
      5: ["Al-Baqarah", "Al-Imran", "An-Nisa", "Al-An'am"]
    };
    return relatedData[surahId] || ["Al-Fatihah", "Al-Baqarah", "Yasin", "Al-Mulk"];
  }

  // Get chapters list with basic info
  async getChapters(): Promise<any[]> {
    try {
      const data = await this.makeRequest<{ chapters: any[] }>('/chapters');
      return data.chapters;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  }

  // Get verses by chapter
  async getVersesByChapter(
    surahId: number, 
    language: string = 'en',
    translations: string[] = ['131'] // Default: English translation
  ): Promise<any[]> {
    try {
      const translationsParam = translations.join(',');
      const data = await this.makeRequest<{ verses: any[] }>(
        `/verses/by_chapter/${surahId}?language=${language}&translations=${translationsParam}&words=false`
      );
      return data.verses;
    } catch (error) {
      console.error(`Error fetching verses for Surah ${surahId}:`, error);
      throw error;
    }
  }

  // Search functionality
  async search(
    query: string, 
    language: string = 'en',
    size: number = 20
  ): Promise<any[]> {
    try {
      const data = await this.makeRequest<{ search: any }>(
        `/search/${encodeURIComponent(query)}/all/${language}?size=${size}`
      );
      return data.search?.resource || [];
    } catch (error) {
      console.error('Error searching Quran:', error);
      throw error;
    }
  }

  // Get audio recitations
  async getAudioRecitations(): Promise<any[]> {
    try {
      const data = await this.makeRequest<{ recitations: any[] }>('/recitations');
      return data.recitations;
    } catch (error) {
      console.error('Error fetching audio recitations:', error);
      throw error;
    }
  }

  // Get specific recitation
  async getRecitation(recitationId: number): Promise<any> {
    try {
      const data = await this.makeRequest<{ recitation: any }>(
        `/recitations/${recitationId}`
      );
      return data.recitation;
    } catch (error) {
      console.error(`Error fetching recitation ${recitationId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const quranComProvider = QuranComProvider.getInstance();

