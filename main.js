import sqlite3 from "sqlite3";

async function chatBot(messages, model) {
    const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            model: model, 
            messages: context,
            stream: false })
        
    });

    const data = await response.json();

    createMessage(data.message.content, "assistant")
}

const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button")

chatInput.addEventListener("input", expandInput)

function expandInput () {
    const input = document.getElementById("chat-input");
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
}

const context = [{
    role: "system", 
    content: `You are a helpful, knowledgeable assistant. Format all responses using Markdown — use fenced code blocks with the appropriate language tag for any code, use **bold** for emphasis, and use headers where helpful for organization. Use line breaks where appropriate for readability. 
    Be concise — avoid unnecessary filler, restating the question, or excessive caveats. Get to the point. If a response requires depth, provide it, but never pad a response for the sake of length.

    Do not be charming, complimentary, or sycophantic. Never open with phrases like \"Great question!\" or \"Of course!\" or compliment the user in any way. Just answer.
    If you are unsure about something, say so rather than guessing confidently.
    
    CRITICAL RULE: do not wrap markdown inside of a markdown code block unless the user asks specifically for raw markdown`
}]

function createMessage (text, sender) {
    const messages = document.getElementById("messages")

    const bubble = document.createElement("div")
    bubble.classList.add("message", sender)

    if (sender == "assistant") {
        bubble.innerHTML = marked.parse(text)
        const codeBlocks = bubble.getElementsByTagName("pre")
        messages.appendChild(bubble);
        
        for (i = 0; i < codeBlocks.length; i++){
            const codeBlock = document.createElement("div");

            const header = document.createElement("div")
            const code = document.createElement("p")
            const copyButton = document.createElement("button")
            copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z" /><path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" /></g></svg>`
            const textToCopy = codeBlocks[i].textContent;
            copyButton.onclick = () => copy(textToCopy)

            code.textContent = "output" // default to output so when bot doesn't put what language it will default to output

            const codeClasses = codeBlocks[i].querySelector("code").classList;
            for (j = 0; j < codeClasses.length; j++){
                if (codeClasses[j].startsWith("language-")) {
                    code.textContent = codeClasses[j].replace("language-", '');
                    break;
                }
            }

            codeBlock.appendChild(header)
            header.appendChild(code)
            header.appendChild(copyButton)

            codeBlock.classList.add("code-block");
            header.classList.add("header");
            copyButton.classList.add("copy-button");

            codeBlocks[i].parentNode.insertBefore(codeBlock, codeBlocks[i])
            codeBlock.appendChild(codeBlocks[i])
        }

        hljs.highlightAll();
    }
    if (sender == "user"){
        bubble.textContent = text
        messages.appendChild(bubble)
    }

    //adjust scroll height for future scroll to bottom button
    messages.scrollTop = messages.scrollHeight

    context.push({role: sender, content: text})
}

function copy (text) {
    navigator.clipboard.writeText(text);
}

chatInput.addEventListener("keydown", sendMessage)
sendButton.addEventListener("click", sendMessage)
function sendMessage (event) {
    if (event.key === "Enter" || event.type == "click") { // checks to make sure user either hit enter or hit send button
        if (event.key === "Enter" && event.shiftKey) return; // allows user to type a newline with "enter" + "shift"

        const input = document.getElementById("chat-input")
        const text = input.value
        if (text) { // dont send message if its empty
            createMessage(text, "user");

            input.value = "";
			input.style.height = "auto";

            if (event.key === "Enter") event.preventDefault(); 

            chatBot(context, 'qwen2.5:7b');
            // deepseek-r1:8b
            // deepseek-r1:16b
        }
    }
}
