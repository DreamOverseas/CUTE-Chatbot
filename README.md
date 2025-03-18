# CUTE-Chatbot

Not only it's CUTE, it's also <b>C</b>ool and <b>U</b>ltimate <b>T</b>echnology <b>E</b>ntity Chatbot. <br>
This React component integrated an AI-powered chatbot into your application. Built with React + Vite and styled using TailwindCSS.

## Requirements
- React 19.0.0+
- TailwindCSS 4.0+
- OpenAI API Key and ChatGPT Assistant ID; Or your backend URL for chat.
- Google Cloud API Key

## Installation
To install/update Cute Chatbot, run the following command:

```sh
npm install @dreamoverseas/cute-chatbot
```
If ERRRESOLVE is not about React version conflicts, just add `--legacy-peer-deps`, that might caused by some olddy library that never updates their dependencies but working okay.

## Usage
Import and use the `CuteChatbot` component in your React project:

```jsx
import CuteChatbot from "@dreamoverseas/cute-chatbot";

function App() {
  return (
    <CuteChatbot
      nickname='<The chatbot name you wish to display>'
      openai_api_url='<normally https://api.openai.com>'
      openai_asst_id='<your ChatGPT Assistant ID>'
      openai_api_key='<your OpenAI Key>'
      google_api_key='<your Google Cloud API Key>'
    />
  );
}

export default App;
```
OR
```jsx
import CuteChatbot from "@dreamoverseas/cute-chatbot";

function App() {
  return (
    <CuteChatbot
      nickname='<The chatbot name you wish to display>'
      backend_url='<https://your.backend.url>'
      google_api_key='<your Google Cloud API Key>'
    />
  );
}

export default App;
```
This will create a bobble at the corner of your page and open a window for chat when clicked on.

## Props
| Prop Name       | Type   | Description |
| -------------- | ------ | ----------- |
| `nickname` | string | The name displayed in the chatbot card |
| `openai_api_url` | string | The API endpoint for OpenAI requests |
| `openai_asst_id` | string | The assistant ID used for the chatbot |
| `openai_api_key` | string | Your OpenAI API key |
| `google_api_key` | string | Google API key for additional services |
| `backend_url` | string | The url for the backend with /chat as endpoint |

Note that `nickname` is optional but recommended, if no `nickname` passed it will by default called "CUTE Chatbot". `google_api_key` is compulsory. `backend_url` is optional, if this is provided, there's no need for the `openai_...` props, otherwise necessary.

## Common Issues & Notes
1. **Ensure Dependencies Are Met**
   - This component requires React 19.0.0+ and TailwindCSS 4.0+. Make sure your project dependencies are up to date.

2. **API Keys & Configuration**
   - You must provide valid API keys for `openai_api_key` and `google_api_key` to enable AI responses.
   - Make sure the `openai_api_url` is correctly set to the appropriate API endpoint.
   - Make sure your Key is either read from .env or from your backend, not to expose to the public when your peoject is served to the public.

3. **Component Styling**
   - The default styles can be overridden using the `style` prop or by applying Tailwind classes.

4. **CORS Issues**
   - If you experience CORS errors, check your API server configuration and add the required CORS headers.

5. **Usage in Vite Projects**
   - If using Vite, ensure `define` and `env` variables are properly configured in `vite.config.js` to avoid runtime issues.

## License
MIT License

## Support
Your API details such as secret keys will not be stored, only for making API calls and its verification.
This App is build initially for the Dream Overseas Group. For any issues or feature requests, please open an issue on the repository. We might be able to see that XD.
