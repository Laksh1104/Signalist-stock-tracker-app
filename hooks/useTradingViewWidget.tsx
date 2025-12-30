'use client'
import { useEffect, useRef } from 'react'

type WidgetType = 'script' | 'webcomponent'

const useTradingViewWidget = ( 
    scriptUrl: string, 
    config: Record<string, unknown>, 
    height = 600,
    widgetType: WidgetType = 'script',
    webComponentTag?: string
) => {
   const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
            if (!containerRef.current) return;
            if (containerRef.current.dataset.loaded) return;

            if (widgetType === 'webcomponent' && webComponentTag) {
                // Web component approach (e.g., Ticker Tape)
                const script = document.createElement('script');
                script.type = 'module';
                script.src = scriptUrl;
                script.async = true;

                const element = document.createElement(webComponentTag);
                // Set attributes from config
                Object.entries(config).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        element.setAttribute(key, String(value));
                    }
                });

                containerRef.current.appendChild(script);
                containerRef.current.appendChild(element);
            } else {
                // Classic script approach
                containerRef.current.innerHTML = `<div class="tradingview-widget-container__widget" style="width: 100%; height: ${height}px;"></div>`;

                const script = document.createElement("script");
                script.src = scriptUrl;
                script.async = true;
                script.innerHTML = JSON.stringify(config);

                containerRef.current.appendChild(script);
            }

            containerRef.current.dataset.loaded = 'true';

            return () => {
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                    delete containerRef.current.dataset.loaded;
                }
            }
        },
        [scriptUrl, config, height, widgetType, webComponentTag]
    );

    return containerRef
}
export default useTradingViewWidget
