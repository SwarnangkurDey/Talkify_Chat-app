import React, { useEffect, useRef, useState, useContext } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState('');

  // Handle sending text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    await sendMessage({ text: input.trim() });
    setInput('');
  };

  // Handle sending image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Load messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
        <img src={assets.logo_icon} className='max-w-16' alt='' />
        <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full backdrop-blur-lg">
  {/* Header */}
  <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
    <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 rounded-full" />
    <p className="flex-1 text-lg text-white flex items-center gap-2">
      {selectedUser.fullName}
      {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
    </p>
    <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className="md:hidden max-w-7" />
    <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
  </div>

  {/* Chat Area */}
  <div className="flex-1 flex flex-col gap-2 p-3">
    {messages.slice(-5).map((msg, index) => {  // show only last 5 messages
      const isSent = msg.sendedId === authUser._id;
      return (
        <div key={index} className={`flex items-end gap-2 ${isSent ? 'justify-end' : 'justify-start'}`}>
          {!isSent && <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-7 h-7 rounded-full" />}
          {msg.image ? (
            <img src={msg.image} alt="" className="max-w-[230px] max-h-[300px] object-contain border border-gray-700 rounded-lg" />
          ) : (
            <p className={`p-2 max-w-[200px] md:text-sm font-light break-all rounded-lg text-white
              ${isSent ? 'bg-purple-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
              {msg.text}
            </p>
          )}
          {isSent && <img src={authUser?.profilePic || assets.avatar_icon} alt="" className="w-7 h-7 rounded-full" />}
        </div>
      );
    })}
  </div>

  {/* Bottom Input */}
  <div className="flex-shrink-0 p-3 bg-gray-900/30 flex items-center gap-3">
    <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
      <input
        type="text"
        placeholder="Send a message"
        className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
      />
      <input onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
      <label htmlFor="image">
        <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
      </label>
    </div>
    <img onClick={handleSendMessage} src={assets.send_button} alt="" className="w-7 cursor-pointer" />
  </div>
</div>




  );
};

export default ChatContainer;
