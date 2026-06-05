

async function chatBot(prompt, context, model) {
    // const response = await ollama.chat({
    // model: 'deepseek-r1:8b',
    // messages: [{ role: 'user', content: prompt }],
    // })

    const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            model: 'qwen2.5:7b', 
            messages: [{ role: "user", content: prompt }],
            stream: false })
        
    });

    const data = await response.json();

    createMessage(data.message.content, "bot")
}

const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button")

chatInput.addEventListener("input", expandInput)

function expandInput () {
    const input = document.getElementById("chat-input");
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
}

function createMessage (text, sender) {
    const messages = document.getElementById("messages")

    const bubble = document.createElement("div")
    bubble.classList.add("message", sender)

    bubble.textContent = text

    messages.appendChild(bubble)

    //adjust scroll height for future scroll to bottom button
    messages.scrollTop = messages.scrollHeight
}

chatInput.addEventListener("keydown", sendMessage)
sendButton.addEventListener("click", sendMessage)
function sendMessage (event) {
    if (event.key === "Enter" || event.type == "click") { // checks to make sure user either hit enter or hit send button
        if (event.key === "Enter" && event.shiftKey) return; // allows user to type a newline with "enter" + "shift"

        const input = document.getElementById("chat-input")
        const text = input.value
        if (text) { // don't send message if its empty
            createMessage(text, "user");

            input.value = "";
			input.style.height = "auto";

            if (event.key === "Enter") event.preventDefault(); 

            chatBot(text, "", "");
        }
    }
}