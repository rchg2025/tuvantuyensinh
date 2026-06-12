"use client";

import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("@/components/Chatbot"), { ssr: false });
const ZaloWidget = dynamic(() => import("@/components/ZaloWidget"), { ssr: false });

export default function DynamicWidgets({
  zaloEnabled,
  zaloOaWidget,
  zaloPosition,
  chatbotEnabled,
  chatbotColor,
  chatbotPosition,
  chatbotWidth,
  chatbotHeight,
  logoUrl,
  siteTitle
}: any) {
  return (
    <>
      {zaloEnabled && !!zaloOaWidget && (
        <ZaloWidget html={zaloOaWidget} position={zaloPosition} />
      )}
      {chatbotEnabled && (
        <Chatbot 
          color={chatbotColor} 
          position={chatbotPosition} 
          width={chatbotWidth} 
          height={chatbotHeight} 
          logoUrl={logoUrl} 
          siteTitle={siteTitle} 
        />
      )}
    </>
  );
}
