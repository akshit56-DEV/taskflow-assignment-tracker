import { useEffect } from 'react';

/**
 * BotpressChatbot
 * Injects the Botpress v5 webchat scripts once into the DOM.
 * Renders a floating chat bubble on every page globally.
 */
export const BotpressChatbot: React.FC = () => {
  useEffect(() => {
    // Guard: avoid injecting scripts more than once
    if (document.getElementById('botpress-inject')) return;

    const injectScript = document.createElement('script');
    injectScript.id = 'botpress-inject';
    injectScript.src = 'https://cdn.botpress.cloud/webchat/v5.0/inject.js';
    injectScript.async = true;
    document.body.appendChild(injectScript);

    const configScript = document.createElement('script');
    configScript.id = 'botpress-config';
    configScript.src =
      'https://files.bpcontent.cloud/2026/10/22/05/20261022051124-0N0QJ7TA.js';
    configScript.defer = true;
    document.body.appendChild(configScript);
  }, []);

  return null;
};

export default BotpressChatbot;
