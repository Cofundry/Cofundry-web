(function () {
  const currentScript = document.currentScript;
  const botId = currentScript.getAttribute("botId") || "default-bot-id";

  // Create Chat Button
  const button = document.createElement("div");
  button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>`;
  Object.assign(button.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: "10000",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "all 0.3s ease",
  });

  document.body.appendChild(button);

  // Create iframe once (keep it hidden initially)
  const iframe = document.createElement("iframe");
  iframe.src = `http://localhost:3000/playground/${botId}`;
  iframe.setAttribute("scrolling", "no");
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "84px",
    right: "16px",
    width: "min(400px, 95vw)",
    height: "min(570px, 87vh)",
    borderRadius: "16px",
    border: "none",
    zIndex: "9999",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    display: "none", // Initially hidden
  });

  document.body.appendChild(iframe);

  let isOpen = false;

  const toggleIframe = () => {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? "block" : "none";
  };

  button.onclick = toggleIframe;
})();
