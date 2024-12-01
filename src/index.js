// import AgoraRTC from "agora-rtc-sdk-ng";

// // Replace these with your Agora credentials
// const APP_ID = "7a270518f2e24906a2b0beda9bfd3b31"; // Your Agora App ID
// const TOKEN = null;   // Use null if not using a token
// const CHANNEL = "testChannel"; // Channel name

// // Initialize Agora client in live mode
// const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

// async function startHost() {
//     try {
//         // Set the user role to "host"
//         await client.setClientRole("host");

//         // Join the channel as a host
//         const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);
//         console.log("Host joined channel:", CHANNEL, "UID:", uid);

//         // Create and play the local video track
//         const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
//         const localVideoContainer = document.getElementById("local-video");
//         localVideoTrack.play(localVideoContainer);

//         // Publish the host's video track
//         await client.publish([localVideoTrack]);
//         console.log("Host published video track");

//     } catch (error) {
//         console.error("Error starting as host:", error);
//     }
// }

// async function startAudience() {
//     try {
//         // Set the user role to "audience"
//         await client.setClientRole("audience");

//         // Join the channel as an audience member
//         const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);
//         console.log("Audience joined channel:", CHANNEL, "UID:", uid);

//         // Subscribe to the host's video and audio streams
//         client.on("user-published", async (user, mediaType) => {
//             console.log("Host published:", user.uid);

//             // Subscribe to the host's media
//             await client.subscribe(user, mediaType);

//             if (mediaType === "video") {
//                 // Play the host's video
//                 const remoteVideoTrack = user.videoTrack;
//                 const remoteContainer = document.getElementById("local-video"); // Display in the same container
//                 remoteVideoTrack.play(remoteContainer);
//             }

//             if (mediaType === "audio") {
//                 const remoteAudioTrack = user.audioTrack;
//                 remoteAudioTrack.play(); // Play the host's audio
//             }
//         });

//     } catch (error) {
//         console.error("Error starting as audience:", error);
//     }
// }

// // Buttons for host and audience roles
// document.getElementById("startHost").onclick = startHost;
// document.getElementById("startAudience").onclick = startAudience;

import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";

// Replace these with your Agora credentials
const APP_ID = "7a270518f2e24906a2b0beda9bfd3b31"; // Your Agora App ID
const TOKEN = null; // Use null if not using a token
const CHANNEL = "testChannel"; // Channel name

// Initialize Agora RTC client
const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

// Initialize Agora RTM client
const rtmClient = AgoraRTM.createInstance(APP_ID);
let rtmChannel;
let userName;

// Chatroom elements
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// Handle Name Modal
document.getElementById("joinButton").onclick = async () => {
    userName = document.getElementById("nameInput").value.trim();
    if (!userName) {
        alert("Please enter your name.");
        return;
    }

    // Hide the name modal
    document.getElementById("nameModal").style.display = "none";
};

// Start as host
async function startHost() {
    try {
        if (!userName) {
            alert("Please enter your name first.");
            return;
        }

        await client.setClientRole("host");
        const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);
        console.log("Host joined channel:", CHANNEL, "UID:", uid);

        const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        const localVideoContainer = document.getElementById("local-video");
        localVideoTrack.play(localVideoContainer);

        await client.publish([localVideoTrack]);
        console.log("Host published video track.");

        await setupRTM(uid);
    } catch (error) {
        console.error("Error starting as host:", error.message || error);
    }
}

// Start as audience
async function startAudience() {
    try {
        if (!userName) {
            alert("Please enter your name first.");
            return;
        }

        await client.setClientRole("audience");
        const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);
        console.log("Audience joined channel:", CHANNEL, "UID:", uid);

        client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === "video") {
                const remoteVideoTrack = user.videoTrack;
                const remoteContainer = document.getElementById("local-video");
                remoteVideoTrack.play(remoteContainer);
            }
        });

        await setupRTM(uid);
    } catch (error) {
        console.error("Error starting as audience:", error.message || error);
    }
}

// Setup RTM for chat
async function setupRTM(uid) {
    try {
        await rtmClient.login({ uid: String(uid) });
        console.log("RTM Client logged in.");

        rtmChannel = await rtmClient.createChannel(CHANNEL);
        await rtmChannel.join();
        console.log("RTM Channel joined.");

        rtmChannel.on("ChannelMessage", (message, memberId) => {
            displayMessage(memberId, message.text);
        });
    } catch (error) {
        console.error("Error setting up RTM:", error.message || error);
    }
}

// Send a chat message
document.getElementById("sendButton").onclick = async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    try {
        await rtmChannel.sendMessage({ text: `${userName}: ${message}` });
        displayMessage("You", message);
        chatInput.value = "";
    } catch (error) {
        console.error("Error sending message:", error.message || error);
    }
};

// Display a message in the chatroom
function displayMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.textContent = `${sender}: ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
}

// Attach functions to buttons
document.getElementById("startHost").onclick = startHost;
document.getElementById("startAudience").onclick = startAudience;
