const googleApiKey = import.meta.env.VITE_GOOGLE_API;

let currentAudio = null;

/**
 * Stop any playing audio from this util component
 */
export function stopGoogleTTS() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Based on the passed-in text and locale code，Synthesize audio through Google Cloud Text-to-Speech API and play immediately.
 * Note: Calling this would stop any playing Audio from this util.
 * @param {string} text - Script to read-out
 * @param {string} locale - BCP-47 language code, like 'en-AU','zh-CN', 'ja-JP' ...
 */
export async function speakWithGoogle(text, locale) {
    stopGoogleTTS();

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`;

  const requestBody = {
    input: { text },
    voice: {
      languageCode: locale,
      ssmlGender: 'NEUTRAL'
    },
    audioConfig: { audioEncoding: 'MP3' }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.audioContent) {
      // Encode the base64 Data URI into play-able sudio
      currentAudio = new Audio("data:audio/mp3;base64," + data.audioContent);
      currentAudio.play();
    } else {
      console.error("Google TTS API returns no audioContent：", data);
    }
  } catch (error) {
    console.error("Unknown Error with speakWithGoogle()", error);
  }
}


export default {speakWithGoogle , stopGoogleTTS};


/**  ======================= Demo usage of this util ========================== (テスト成功)
 * 
 *    import { speakWithGoogle, stopGoogleTTS } from './utils/GoogleTTS';
 * 
      <button onClick={() => speakWithGoogle("When you hear my voice, this API has been tested successful.", 'en-AU')}>
        Say EN
      </button>
      <button onClick={() => speakWithGoogle("当你听到我的声音时，代表着该API测试成功。", 'zh-CN')}>
        Say ZH
      </button>
      <button onClick={() => speakWithGoogle("当你听到我嘅声音时，代表着该API测试掂。", 'yue-HK')}>
        Say HK
      </button>
      <button onClick={() => speakWithGoogle("When you hear my voice, This API has been tested successful.", 'en-IN')}>
        Say EN-IN
      </button>
      <button onClick={() => speakWithGoogle("私の声を聞くと、この API は正常にテストされました。", 'ja-JP')}>
        Say JP
      </button>
      <button onClick={stopGoogleTTS}>
        Stop It
      </button>
 * 
 *    =========================================================================
 */
