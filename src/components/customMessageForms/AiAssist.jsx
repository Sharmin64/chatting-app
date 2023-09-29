import React, {useEffect, useState} from "react";
import MessageFormUi from "./MessageFormUi";
import {usePostAiAssistMutation} from "@/states/api";

function useDebounce(value, delay) {
  const [debouncedValue, setDeboucedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDeboucedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
const AiAssist = ({props, activeChat}) => {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState("");
  const [triggerAssist, resultAssist] = usePostAiAssistMutation();
  const [appendText, setAppendText] = useState("");
  const handleChange = (e) => setMessage(e.target.value);
  const handleSubmit = async () => {
    const date = new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", `${Math.floor(Math.random() * 1000)}+00:00`);
    const at = attachment ? [{blob: attachment, file: attachment.name}] : [];
    const form = {
      attachments: at,
      created: date,
      sender_username: props.username,
      text: message,
      activeChatId: activeChat.id,
    };

    props.onSubmit(form);
    triggerAssist(form);
    setMessage("");
    setAttachment("");
  };
  const debouncedValue = useDebounce(message, 1000);

  useEffect(() => {
    if (debouncedValue) {
      const form = {text: message};
      triggerAssist(form);
    }
  }, [debouncedValue]);

  const handleKeyDown = (e) => {
    if (e.keyCode === 9 || e.keyCode === 13) {
      e.preventDefault();
      setMessage(`${message}  ${appendText}`);
    }
    setAppendText("");
  };

  useEffect(() => {
    if (resultAssist.data?.text) {
      setAppendText(resultAssist.data?.text);
    }
  }, [resultAssist]);

  return (
    <MessageFormUi
      setAttachment={setAttachment}
      message={message}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      appendText={appendText}
      handleKeyDown={handleKeyDown}
    ></MessageFormUi>
  );
};

export default AiAssist;
