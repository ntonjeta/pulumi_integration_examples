$(document).ready(function () {
    loadMessages();
    $("#sendButton").on('click', function () {
        $.post('messages', { value: messageInput.value })
        loadMessages();
    });
});

function loadMessages() {
    var messageBox = $("#messageBox");
    messageBox.empty()
    $.get("messages", (res) => {
        $.each(res.messages, (message) => {
            messageBox.append("<p>" + res.messages[message] + "</p>")
        });
    })
    console.log("message loaded!");
}