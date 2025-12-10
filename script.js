const API_KEY = "AIzaSyDrnGzp0ewFjGH8icSSJzU2J7eG8XVkNCY";

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
});

function animateLoading(text, element) {
  let dotCount = 0;
  return setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    element.textContent = text + '.'.repeat(dotCount);
  }, 500);
}

function formatResponse(text) {

  const cleanText = text.replace(/\*/g, "");
  const lines = cleanText.split(/\n/).filter(line => line.trim() !== "");
  let html = "";

  for (let line of lines) {
    const sectionMatch = line.match(/^(\d+\.\s+)(.+)/);  // Giữ số thứ tự (1. ...)
    if (sectionMatch) {
      const number = sectionMatch[1];      // "1. "
      const title = sectionMatch[2];       // "Pinyin"
      html += `<strong>${number}${title}</strong>`;
    } else {
      html += `<p>${line}</p>`;
    }
  }

  return html;
}

async function sendToGemini() {
  const input = document.getElementById("inputText").value.trim();
  const responseDiv = document.getElementById("response");

  if (!input) {
    responseDiv.textContent = "⚠️ Please enter a Chinese word or sentence.";
    return;
  }

  responseDiv.textContent = "";
  const loading = animateLoading("⏳ Analyzing", responseDiv);

  const prompt = `Analyze the following Chinese word or sentence: ${input}

Provide these details:
1. Pinyin
2. Sino-Vietnamese reading
3. Meaning
4. Structure / origin
5. Example usage

Respond only with the required details. No greetings or intro.
Use markdown style with **bold** section titles.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    clearInterval(loading);
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    responseDiv.innerHTML = formatResponse(reply);
  } catch (err) {
    clearInterval(loading);
    responseDiv.textContent = "⚠️ Error: " + err.message;
  }
}
