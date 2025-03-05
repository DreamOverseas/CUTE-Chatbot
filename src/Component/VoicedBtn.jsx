import PropTypes from 'prop-types';
// Tailwind style import
import './CuteChatbot.css'

import SoundwaveIcon from '../assets/soundwave.svg?react';

export default function ToggleVoiceBtn({ speakOrNot, setSpeakOrNot }) {

  return (
    <button
      onClick={() => setSpeakOrNot((prev) => !prev)}
      type="button"
      className="focus:outline-none !bg-transparent !border !border-transparent !p-1 !mr-2"
    >
      <SoundwaveIcon className={`!w-6 !h-6 ${speakOrNot ? '!text-green-500' : '!text-gray-500'}`} />
    </button>
  );
}

ToggleVoiceBtn.propTypes = {
  speakOrNot: PropTypes.bool.isRequired,
  setSpeakOrNot: PropTypes.func.isRequired,
};
