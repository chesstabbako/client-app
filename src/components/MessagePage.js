import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Loading from "./Loading";
import Avatar from "./Avatar";
import backgroundImage from "../assets/wallapaper.jpeg";
import { IoMdSend } from "react-icons/io";
import moment from "moment";

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const user = useSelector((state) => state?.user);
  const [allUser, setAllUser] = useState([]);
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    online: false,
    _id: "",
  });

  const [message, setMessage] = useState({
    text: "",
  });

  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const currentMessage = useRef(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allUser]);

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", params.userId);

      socketConnection.emit("seen", params.userId);

      socketConnection.on("message-user", (data) => {
        setDataUser(data);
      });

      socketConnection.on("message", (data) => {
        console.log("message data", data);
        setAllMessage(data);
      });

      socketConnection.on("conversation", (data) => {
        const conversationUserData = data.map((conversationUser, index) => {
          if (
            conversationUser?.sender?._id === conversationUser?.receiver?._id
          ) {
            return {
              ...conversationUser,
              userDetails: conversationUser?.sender,
            };
          } else if (conversationUser?.receiver?._id !== user?._id) {
            return {
              ...conversationUser,
              userDetails: conversationUser.receiver,
            };
          } else {
            return {
              ...conversationUser,
              userDetails: conversationUser.sender,
            };
          }
        });

        setAllUser(conversationUserData)

      });
    }
  }, [socketConnection, params?.userId, user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setMessage((preve) => {
      return {
        ...preve,
        text: value,
      };
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (message.text) {
      if (socketConnection) {
        socketConnection.emit("new message", {
          sender: user?._id,
          text: message.text,
          msgByUserId: user?._id,
        });
        setMessage({
          text: "",
        });
      }
    }
  };

  console.log("hey:", allUser);
  console.log("user_id_conected", user._id);

  return (
    <div
      style={{ backgroundImage: `url(${backgroundImage})` }}
      className="bg-no-repeat bg-cover"
    >
      {/***show all message */}
      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50">
        {/**all message show here */}
        <div className="flex flex-col gap-2 py-2 mx-2" ref={currentMessage}>
          {allUser.map((messages, index) => {
            messages.allMsgs?.map((msg, index) => {
              console.log('msg', msg.text)
              return (
                <div
                  className={` p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${
                    user._id === msg?._id
                      ? "ml-auto bg-teal-100"
                      : "bg-white"
                  }`}
                >
                  <div>
                    <Avatar name={dataUser?.name} width={10} height={10} />
                  </div>
                  <p className="px-2">{"hola"}</p>
                  <p className="text-xs ml-auto w-fit">
                    {moment(msg.createdAt).format("hh:mm")}
                  </p>
                </div>
              );
            });
          })}
        </div>

        {loading && (
          <div className="w-full h-full flex sticky bottom-0 justify-center items-center">
            <Loading />
          </div>
        )}
      </section>

      {/**send message */}
      <section className="h-16 bg-white flex items-center px-4">
        {/**input box */}
        <form className="h-full w-full flex gap-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Digite aqui a mensagem..."
            className="py-1 px-4 outline-none w-full h-full"
            value={message.text}
            onChange={handleOnChange}
          />
          <button className="text-primary hover:text-secondary">
            <IoMdSend size={28} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;
