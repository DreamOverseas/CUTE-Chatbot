const googleApiKey = import.meta.env.VITE_GOOGLE_API;

let currentAudio = null;

/**
 * 停止当前正在播放的音频
 */
export function stopGoogleTTS() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * 根据传入的文本和 locale，通过 Google Cloud Text-to-Speech API 合成语音并立即播放
 * @param {string} text - 要转换为语音的文本
 * @param {string} locale - BCP-47 格式的语言代码，例如 'en-AU'、'zh-CN'等
 */
export async function speakWithGoogle(text, locale) {
    stopGoogleTTS();

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`;

  // 构造请求体
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

    console.log("Google TTS Returns:");
    console.log(data);

    if (data.audioContent) {
      // 使用 Data URI 构造音频源，并播放
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


/**  ======================= Demo usage of this util ==========================
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
