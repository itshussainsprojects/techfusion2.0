// Enhanced Urdu TTS Library for Pakistani Accent
// Multiple fallback methods for authentic Urdu pronunciation

export class UrduTTS {
  private static instance: UrduTTS
  private voiceSpeed: number = 1.0
  private volume: number = 0.8

  static getInstance(): UrduTTS {
    if (!UrduTTS.instance) {
      UrduTTS.instance = new UrduTTS()
    }
    return UrduTTS.instance
  }

  setSpeed(speed: number) {
    this.voiceSpeed = speed
  }

  setVolume(volume: number) {
    this.volume = volume
  }

  // Method 1: Google Translate TTS (Best quality)
  async playGoogleUrduTTS(text: string): Promise<boolean> {
    try {
      const encodedText = encodeURIComponent(text)
      const urls = [
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=ur&client=tw-ob&q=${encodedText}`,
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encodedText}`, // Hindi fallback
      ]

      for (const url of urls) {
        try {
          const audio = new Audio()
          audio.crossOrigin = "anonymous"
          audio.volume = this.volume
          audio.playbackRate = this.voiceSpeed

          await new Promise((resolve, reject) => {
            audio.oncanplaythrough = () => {
              audio.play().then(resolve).catch(reject)
            }
            audio.onerror = reject
            audio.src = url
          })
          return true
        } catch (error) {
          console.log(`Failed URL: ${url}`)
          continue
        }
      }
      return false
    } catch (error) {
      console.log('Google TTS completely failed')
      return false
    }
  }

  // Method 2: ResponsiveVoice API
  playResponsiveVoiceUrdu(text: string): boolean {
    try {
      if (typeof (window as any).responsiveVoice !== 'undefined') {
        const voices = ['Hindi Female', 'Hindi Male', 'UK English Female', 'US English Female']
        const randomVoice = voices[Math.floor(Math.random() * voices.length)]
        
        (window as any).responsiveVoice.speak(text, randomVoice, {
          rate: this.voiceSpeed,
          pitch: 1.1,
          volume: this.volume
        })
        return true
      }
      return false
    } catch (error) {
      console.log('ResponsiveVoice failed')
      return false
    }
  }

  // Method 3: Browser Speech Synthesis with Hindi/Urdu voices
  playBrowserUrduTTS(text: string): boolean {
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      const voices = speechSynthesis.getVoices()
      
      // Priority order for voice selection
      const voicePreferences = [
        (v: SpeechSynthesisVoice) => v.lang.includes('ur'), // Urdu
        (v: SpeechSynthesisVoice) => v.lang.includes('hi'), // Hindi
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('urdu'),
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('hindi'),
        (v: SpeechSynthesisVoice) => v.lang.includes('en-IN'), // Indian English
        (v: SpeechSynthesisVoice) => v.lang.includes('en-GB'), // British English
      ]

      let selectedVoice = null
      for (const preference of voicePreferences) {
        selectedVoice = voices.find(preference)
        if (selectedVoice) break
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice
        utterance.lang = selectedVoice.lang
      } else {
        utterance.lang = 'hi-IN' // Default to Hindi
      }

      utterance.rate = this.voiceSpeed
      utterance.pitch = 1.1
      utterance.volume = this.volume

      speechSynthesis.speak(utterance)
      return true
    } catch (error) {
      console.log('Browser TTS failed')
      return false
    }
  }

  // Method 4: Romanized Urdu with English voice (Fallback)
  playRomanizedUrdu(text: string): boolean {
    try {
      const romanizedText = this.convertToRomanized(text)
      const utterance = new SpeechSynthesisUtterance(romanizedText)
      
      const voices = speechSynthesis.getVoices()
      const englishVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'))
      
      if (englishVoice) {
        utterance.voice = englishVoice
      }

      utterance.rate = this.voiceSpeed * 0.9 // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = this.volume

      speechSynthesis.speak(utterance)
      return true
    } catch (error) {
      console.log('Romanized Urdu failed')
      return false
    }
  }

  // Convert Urdu text to romanized pronunciation
  private convertToRomanized(urduText: string): string {
    const urduToRoman: { [key: string]: string } = {
      'واہ': 'Wah',
      'شاباش': 'Shabash',
      'زبردست': 'Zabardast',
      'کمال': 'Kamaal',
      'بہت': 'bohat',
      'تیز': 'tez',
      'نے': 'ne',
      'کیا': 'kiya',
      'مکمل': 'mukammal',
      'حل': 'hal',
      'جمع': 'jama',
      'ختم': 'khatam',
      'پورا': 'poora',
      'صبح بخیر': 'Subah bakhair',
      'دوپہر بخیر': 'Dopahar bakhair',
      'شام بخیر': 'Shaam bakhair',
      'بہترین': 'behtareen',
      'لاجواب': 'lajawaab',
      'عمدہ': 'umda',
      'فوری': 'fori',
      'جلدی': 'jaldi',
      'رفتار': 'raftar',
      'بجلی': 'bijli',
      'تیزی': 'tezi',
      'طور': 'taur',
      'پر': 'par',
      'سے': 'se',
      'الگورتھم': 'Algorithm',
      'چیلنج': 'Challenge',
      'ڈیٹا': 'Data',
      'سٹرکچر': 'Structure',
      'مسئلہ': 'Problem',
      'اے آئی': 'A I',
      'پروجیکٹ': 'Project',
      'ویب': 'Web',
      'ڈیولپمنٹ': 'Development',
      'ٹاسک': 'Task',
      'کوڈنگ': 'Coding'
    }

    let romanized = urduText
    for (const [urdu, roman] of Object.entries(urduToRoman)) {
      romanized = romanized.replace(new RegExp(urdu, 'g'), roman)
    }
    return romanized
  }

  // Main method: Try all methods in order
  async speak(text: string): Promise<boolean> {
    console.log(`🎙️ Attempting to speak Urdu: ${text}`)

    // Method 1: Google TTS (best quality)
    try {
      if (await this.playGoogleUrduTTS(text)) {
        console.log('✅ Google TTS succeeded')
        return true
      }
    } catch (error) {
      console.log('❌ Google TTS failed')
    }

    // Method 2: ResponsiveVoice
    try {
      if (this.playResponsiveVoiceUrdu(text)) {
        console.log('✅ ResponsiveVoice succeeded')
        return true
      }
    } catch (error) {
      console.log('❌ ResponsiveVoice failed')
    }

    // Method 3: Browser TTS with Hindi/Urdu
    try {
      if (this.playBrowserUrduTTS(text)) {
        console.log('✅ Browser Urdu TTS succeeded')
        return true
      }
    } catch (error) {
      console.log('❌ Browser Urdu TTS failed')
    }

    // Method 4: Romanized fallback
    try {
      if (this.playRomanizedUrdu(text)) {
        console.log('✅ Romanized Urdu fallback succeeded')
        return true
      }
    } catch (error) {
      console.log('❌ All TTS methods failed')
    }

    return false
  }
}

export default UrduTTS
